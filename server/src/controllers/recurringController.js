import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';
import { sendError, sendSuccess } from '../utils/response.js';

function computeNextDueDate(currentDate, frequency) {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export const recurringController = {
  // GET /api/recurring
  async list(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const items = await db
      .collection('recurring_transactions')
      .aggregate([
        { $match: { ownerId: userId } },
        { $sort: { nextDueDate: 1 } },
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
          $project: {
            _id: 1,
            description: 1,
            type: 1,
            amountPaise: 1,
            frequency: 1,
            nextDueDate: 1,
            active: 1,
            merchant: 1,
            createdAt: 1,
            category: { $arrayElemAt: ['$category', 0] },
            account: { $arrayElemAt: ['$account', 0] },
          },
        },
      ])
      .toArray();

    const formatted = items.map((i) => ({
      id: i._id.toString(),
      description: i.description,
      type: i.type,
      amountPaise: i.amountPaise,
      amountRupees: toRupees(i.amountPaise),
      frequency: i.frequency,
      nextDueDate: i.nextDueDate,
      active: i.active !== false,
      merchant: i.merchant || '',
      categoryName: i.category?.name || 'Uncategorized',
      categoryIcon: i.category?.icon || 'Tag',
      accountName: i.account?.name || 'Default Account',
    }));

    return sendSuccess(res, formatted);
  },

  // POST /api/recurring
  async create(req, res) {
    const {
      description,
      type = 'expense',
      amount,
      frequency = 'monthly',
      startDate,
      categoryId,
      accountId,
      merchant,
    } = req.body || {};

    if (!description || !description.trim()) {
      return sendError(res, 'Description is required', 400);
    }

    if (!['income', 'expense'].includes(type)) {
      return sendError(res, 'Type must be income or expense', 400);
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return sendError(res, 'Frequency must be daily, weekly, monthly, or yearly', 400);
    }

    let amountPaise = 0;
    try {
      amountPaise = toPaise(amount);
      if (amountPaise <= 0) return sendError(res, 'Amount must be greater than zero', 400);
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    if (!accountId || !ObjectId.isValid(accountId)) {
      return sendError(res, 'Valid account ID is required', 400);
    }

    const nextDueDate = startDate ? new Date(startDate) : new Date();

    const db = getDb();
    const newSchedule = {
      ownerId: req.user._id,
      description: description.trim(),
      type,
      amountPaise,
      frequency,
      nextDueDate,
      accountId: new ObjectId(accountId),
      categoryId: categoryId && ObjectId.isValid(categoryId) ? new ObjectId(categoryId) : null,
      merchant: merchant ? String(merchant).trim() : '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('recurring_transactions').insertOne(newSchedule);
    newSchedule.id = result.insertedId.toString();

    return sendSuccess(res, newSchedule, 'Recurring schedule created', 201);
  },

  // POST /api/recurring/:id/execute (Manually or on-demand post the due transaction)
  async execute(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid schedule ID', 400);
    }

    const db = getDb();
    const schedule = await db.collection('recurring_transactions').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!schedule) {
      return sendError(res, 'Schedule not found', 404);
    }

    // Insert actual transaction
    const newTx = {
      ownerId: req.user._id,
      type: schedule.type,
      amountPaise: schedule.amountPaise,
      currency: 'INR',
      accountId: schedule.accountId,
      categoryId: schedule.categoryId,
      date: new Date(),
      description: `${schedule.description} (Auto Recurring)`,
      merchant: schedule.merchant || '',
      notes: `Generated from recurring rule (${schedule.frequency})`,
      tags: ['recurring'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('transactions').insertOne(newTx);

    // Compute next due date
    const nextDueDate = computeNextDueDate(schedule.nextDueDate || new Date(), schedule.frequency);

    await db.collection('recurring_transactions').updateOne(
      { _id: schedule._id },
      {
        $set: {
          nextDueDate,
          lastExecutedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return sendSuccess(
      res,
      { nextDueDate },
      'Transaction generated and schedule advanced to next due date'
    );
  },

  // DELETE /api/recurring/:id
  async delete(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid schedule ID', 400);
    }

    const db = getDb();
    const result = await db.collection('recurring_transactions').deleteOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Schedule not found', 404);
    }

    return sendSuccess(res, null, 'Schedule deleted successfully');
  },
};
