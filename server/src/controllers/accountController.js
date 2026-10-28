import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toPaise } from '../utils/currency.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const accountController = {
  // GET /api/accounts
  async list(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const accounts = await db
      .collection('accounts')
      .find({ ownerId: userId })
      .sort({ createdAt: 1 })
      .toArray();

    // Compute live balance for each account using transaction aggregation
    const txAggregation = await db
      .collection('transactions')
      .aggregate([
        { $match: { ownerId: userId } },
        {
          $facet: {
            // Income transactions
            inflow: [
              { $match: { type: 'income' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            // Expense transactions
            outflow: [
              { $match: { type: 'expense' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            // Transfers sent out
            transfersOut: [
              { $match: { type: 'transfer' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            // Transfers received
            transfersIn: [
              { $match: { type: 'transfer' } },
              { $group: { _id: '$targetAccountId', total: { $sum: '$amountPaise' } } },
            ],
          },
        },
      ])
      .toArray();

    const stats = txAggregation[0] || {
      inflow: [],
      outflow: [],
      transfersOut: [],
      transfersIn: [],
    };

    const inflowMap = new Map(stats.inflow.map((i) => [String(i._id), i.total]));
    const outflowMap = new Map(stats.outflow.map((o) => [String(o._id), o.total]));
    const xferOutMap = new Map(stats.transfersOut.map((t) => [String(t._id), t.total]));
    const xferInMap = new Map(stats.transfersIn.map((t) => [String(t._id), t.total]));

    const computedAccounts = accounts.map((acc) => {
      const idStr = String(acc._id);
      const starting = Number(acc.startingBalancePaise || 0);
      const inVal = inflowMap.get(idStr) || 0;
      const outVal = outflowMap.get(idStr) || 0;
      const xOut = xferOutMap.get(idStr) || 0;
      const xIn = xferInMap.get(idStr) || 0;

      // Net balance in exact integer paise
      const currentBalancePaise = starting + inVal - outVal - xOut + xIn;

      return {
        id: idStr,
        name: acc.name,
        type: acc.type,
        currency: acc.currency || 'INR',
        color: acc.color || '#F4D52E',
        startingBalancePaise: starting,
        balancePaise: currentBalancePaise,
        createdAt: acc.createdAt,
      };
    });

    const totalNetWorthPaise = computedAccounts.reduce((sum, a) => sum + a.balancePaise, 0);

    return sendSuccess(res, {
      accounts: computedAccounts,
      totalNetWorthPaise,
    });
  },

  // POST /api/accounts
  async create(req, res) {
    const { name, type = 'bank', startingBalance = 0, color = '#F4D52E' } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Account name is required', 400);
    }

    let startingBalancePaise = 0;
    try {
      startingBalancePaise = toPaise(startingBalance);
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    const db = getDb();
    const newAccount = {
      ownerId: req.user._id,
      name: name.trim(),
      type: ['bank', 'cash', 'savings', 'wallet', 'investment', 'other'].includes(type)
        ? type
        : 'bank',
      currency: 'INR',
      startingBalancePaise,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('accounts').insertOne(newAccount);
    newAccount.id = result.insertedId.toString();

    return sendSuccess(res, newAccount, 'Account created successfully', 201);
  },

  // PUT /api/accounts/:id
  async update(req, res) {
    const { id } = req.params;
    const { name, type, color, startingBalance } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid account ID', 400);
    }

    const db = getDb();
    const existing = await db.collection('accounts').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!existing) {
      return sendError(res, 'Account not found', 404);
    }

    const updateFields = { updatedAt: new Date() };
    if (name && typeof name === 'string') updateFields.name = name.trim();
    if (type) updateFields.type = type;
    if (color) updateFields.color = color;
    if (startingBalance !== undefined) {
      try {
        updateFields.startingBalancePaise = toPaise(startingBalance);
      } catch (err) {
        return sendError(res, err.message, 400);
      }
    }

    await db.collection('accounts').updateOne(
      { _id: new ObjectId(id), ownerId: req.user._id },
      { $set: updateFields }
    );

    return sendSuccess(res, null, 'Account updated successfully');
  },

  // DELETE /api/accounts/:id
  async delete(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid account ID', 400);
    }

    const db = getDb();
    const accountId = new ObjectId(id);

    // Check if account has transactions
    const txCount = await db.collection('transactions').countDocuments({
      ownerId: req.user._id,
      $or: [{ accountId }, { targetAccountId: accountId }],
    });

    if (txCount > 0) {
      return sendError(
        res,
        `Cannot delete account with ${txCount} linked transaction(s). Please delete or reassign transactions first.`,
        409
      );
    }

    const deleteResult = await db.collection('accounts').deleteOne({
      _id: accountId,
      ownerId: req.user._id,
    });

    if (deleteResult.deletedCount === 0) {
      return sendError(res, 'Account not found', 404);
    }

    return sendSuccess(res, null, 'Account deleted successfully');
  },
};
