import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const transactionController = {
  // GET /api/transactions
  async list(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = { ownerId: userId };

    if (req.query.type && ['income', 'expense', 'transfer'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    if (req.query.accountId && ObjectId.isValid(req.query.accountId)) {
      const accId = new ObjectId(req.query.accountId);
      filter.$or = [{ accountId: accId }, { targetAccountId: accId }];
    }

    if (req.query.categoryId && ObjectId.isValid(req.query.categoryId)) {
      filter.categoryId = new ObjectId(req.query.categoryId);
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Text search in description or merchant
    if (req.query.q && typeof req.query.q === 'string' && req.query.q.trim()) {
      const searchTerm = req.query.q.trim();
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { description: { $regex: searchTerm, $options: 'i' } },
          { merchant: { $regex: searchTerm, $options: 'i' } },
          { notes: { $regex: searchTerm, $options: 'i' } },
        ],
      });
    }

    // Sorting
    const sortField = req.query.sortBy === 'amount' ? 'amountPaise' : 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder, _id: -1 };

    const totalCount = await db.collection('transactions').countDocuments(filter);

    // Fetch joined with category & account names using aggregate
    const transactions = await db
      .collection('transactions')
      .aggregate([
        { $match: filter },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'account',
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'targetAccountId',
            foreignField: '_id',
            as: 'targetAccount',
          },
        },
        {
          $project: {
            _id: 1,
            type: 1,
            amountPaise: 1,
            currency: 1,
            date: 1,
            description: 1,
            merchant: 1,
            notes: 1,
            tags: 1,
            createdAt: 1,
            category: { $arrayElemAt: ['$category', 0] },
            account: { $arrayElemAt: ['$account', 0] },
            targetAccount: { $arrayElemAt: ['$targetAccount', 0] },
          },
        },
      ])
      .toArray();

    const formatted = transactions.map((t) => ({
      id: t._id.toString(),
      type: t.type,
      amountPaise: t.amountPaise,
      amountRupees: toRupees(t.amountPaise),
      currency: t.currency || 'INR',
      date: t.date,
      description: t.description,
      merchant: t.merchant || '',
      notes: t.notes || '',
      tags: t.tags || [],
      categoryId: t.category?._id?.toString() || null,
      categoryName: t.category?.name || 'Uncategorized',
      categoryIcon: t.category?.icon || 'Tag',
      categoryColor: t.category?.color || '#F4D52E',
      accountId: t.account?._id?.toString() || null,
      accountName: t.account?.name || 'Default Account',
      accountColor: t.account?.color || '#F4D52E',
      targetAccountId: t.targetAccount?._id?.toString() || null,
      targetAccountName: t.targetAccount?.name || null,
      createdAt: t.createdAt,
    }));

    return sendSuccess(res, {
      transactions: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  },

  // GET /api/transactions/:id
  async getById(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid transaction ID', 400);
    }

    const db = getDb();
    const t = await db.collection('transactions').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!t) {
      return sendError(res, 'Transaction not found', 404);
    }

    return sendSuccess(res, {
      id: t._id.toString(),
      type: t.type,
      amountPaise: t.amountPaise,
      amountRupees: toRupees(t.amountPaise),
      currency: t.currency || 'INR',
      date: t.date,
      description: t.description,
      merchant: t.merchant || '',
      notes: t.notes || '',
      tags: t.tags || [],
      accountId: t.accountId?.toString() || null,
      categoryId: t.categoryId?.toString() || null,
      targetAccountId: t.targetAccountId?.toString() || null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    });
  },

  // POST /api/transactions
  async create(req, res) {
    const {
      type = 'expense',
      amount,
      accountId,
      categoryId,
      targetAccountId,
      date,
      description,
      merchant,
      notes,
      tags = [],
    } = req.body || {};

    if (!['income', 'expense', 'transfer'].includes(type)) {
      return sendError(res, 'Invalid transaction type. Must be income, expense, or transfer', 400);
    }

    let amountPaise = 0;
    try {
      amountPaise = toPaise(amount);
      if (amountPaise <= 0) {
        return sendError(res, 'Amount must be greater than zero', 400);
      }
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    if (!accountId || !ObjectId.isValid(accountId)) {
      return sendError(res, 'Valid account ID is required', 400);
    }

    const db = getDb();
    const parsedAccountId = new ObjectId(accountId);

    // Verify account ownership
    const sourceAccount = await db.collection('accounts').findOne({
      _id: parsedAccountId,
      ownerId: req.user._id,
    });
    if (!sourceAccount) {
      return sendError(res, 'Specified account does not exist or belong to you', 404);
    }

    let parsedTargetAccountId = null;
    let parsedCategoryId = null;

    if (type === 'transfer') {
      if (!targetAccountId || !ObjectId.isValid(targetAccountId)) {
        return sendError(res, 'Target account ID is required for transfers', 400);
      }
      if (String(accountId) === String(targetAccountId)) {
        return sendError(res, 'Source and target accounts must be different', 400);
      }
      parsedTargetAccountId = new ObjectId(targetAccountId);
      const targetAccount = await db.collection('accounts').findOne({
        _id: parsedTargetAccountId,
        ownerId: req.user._id,
      });
      if (!targetAccount) {
        return sendError(res, 'Target account does not exist or belong to you', 404);
      }
    } else {
      // Income or Expense requires valid category
      if (categoryId && ObjectId.isValid(categoryId)) {
        parsedCategoryId = new ObjectId(categoryId);
      }
    }

    const txDate = date ? new Date(date) : new Date();
    if (isNaN(txDate.getTime())) {
      return sendError(res, 'Invalid transaction date', 400);
    }

    const newTx = {
      ownerId: req.user._id,
      type,
      amountPaise,
      currency: 'INR',
      accountId: parsedAccountId,
      targetAccountId: parsedTargetAccountId,
      categoryId: parsedCategoryId,
      date: txDate,
      description: (description || (type === 'transfer' ? 'Account Transfer' : 'Transaction')).trim(),
      merchant: merchant ? String(merchant).trim() : '',
      notes: notes ? String(notes).trim() : '',
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(newTx);
    newTx.id = result.insertedId.toString();

    return sendSuccess(res, newTx, 'Transaction recorded successfully', 201);
  },

  // PUT /api/transactions/:id
  async update(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid transaction ID', 400);
    }

    const db = getDb();
    const existing = await db.collection('transactions').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!existing) {
      return sendError(res, 'Transaction not found', 404);
    }

    const {
      type,
      amount,
      accountId,
      categoryId,
      targetAccountId,
      date,
      description,
      merchant,
      notes,
      tags,
    } = req.body || {};

    const updateFields = { updatedAt: new Date() };

    if (type && ['income', 'expense', 'transfer'].includes(type)) {
      updateFields.type = type;
    }

    if (amount !== undefined) {
      try {
        const paise = toPaise(amount);
        if (paise <= 0) return sendError(res, 'Amount must be greater than zero', 400);
        updateFields.amountPaise = paise;
      } catch (err) {
        return sendError(res, err.message, 400);
      }
    }

    if (accountId && ObjectId.isValid(accountId)) {
      const acc = await db.collection('accounts').findOne({
        _id: new ObjectId(accountId),
        ownerId: req.user._id,
      });
      if (!acc) return sendError(res, 'Account not found', 404);
      updateFields.accountId = acc._id;
    }

    if (targetAccountId && ObjectId.isValid(targetAccountId)) {
      const acc = await db.collection('accounts').findOne({
        _id: new ObjectId(targetAccountId),
        ownerId: req.user._id,
      });
      if (!acc) return sendError(res, 'Target account not found', 404);
      updateFields.targetAccountId = acc._id;
    }

    if (categoryId && ObjectId.isValid(categoryId)) {
      updateFields.categoryId = new ObjectId(categoryId);
    }

    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        updateFields.date = parsedDate;
      }
    }

    if (description !== undefined) updateFields.description = String(description).trim();
    if (merchant !== undefined) updateFields.merchant = String(merchant).trim();
    if (notes !== undefined) updateFields.notes = String(notes).trim();
    if (Array.isArray(tags)) {
      updateFields.tags = tags.map((t) => String(t).trim()).filter(Boolean);
    }

    await db.collection('transactions').updateOne(
      { _id: new ObjectId(id), ownerId: req.user._id },
      { $set: updateFields }
    );

    return sendSuccess(res, null, 'Transaction updated successfully');
  },

  // DELETE /api/transactions/:id
  async delete(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid transaction ID', 400);
    }

    const db = getDb();
    const result = await db.collection('transactions').deleteOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Transaction not found', 404);
    }

    return sendSuccess(res, null, 'Transaction deleted successfully');
  },

  // GET /api/transactions/export/csv
  async exportCsv(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const transactions = await db
      .collection('transactions')
      .aggregate([
        { $match: { ownerId: userId } },
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'account',
          },
        },
      ])
      .toArray();

    // Generate CSV string
    const headers = [
      'Date',
      'Type',
      'Description',
      'Merchant',
      'Category',
      'Account',
      'Amount (INR)',
      'Notes',
    ];

    const rows = transactions.map((t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const type = t.type.toUpperCase();
      const desc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const merch = `"${(t.merchant || '').replace(/"/g, '""')}"`;
      const cat = `"${(t.category?.[0]?.name || 'Uncategorized').replace(/"/g, '""')}"`;
      const acc = `"${(t.account?.[0]?.name || 'Default').replace(/"/g, '""')}"`;
      const amount = (t.amountPaise / 100).toFixed(2);
      const notes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      return [dateStr, type, desc, merch, cat, acc, amount, notes].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vaultly-transactions-${new Date().toISOString().split('T')[0]}.csv"`,
      'Content-Length': Buffer.byteLength(csvContent),
    });
    res.end(csvContent);
  },
};
