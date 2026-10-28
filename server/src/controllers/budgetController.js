import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const budgetController = {
  // GET /api/budgets?month=YYYY-MM
  async list(req, res) {
    const db = getDb();
    const userId = req.user._id;

    // Default to current month YYYY-MM if omitted
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetMonth = req.query.month || currentMonth;

    // Fetch defined budgets for this month
    const budgets = await db
      .collection('budgets')
      .aggregate([
        { $match: { ownerId: userId, month: targetMonth } },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $project: {
            _id: 1,
            month: 1,
            limitPaise: 1,
            categoryId: 1,
            category: { $arrayElemAt: ['$category', 0] },
          },
        },
      ])
      .toArray();

    // Calculate actual spending in targetMonth
    const [yearStr, monthStr] = targetMonth.split('-');
    const startOfMonth = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    const endOfMonth = new Date(Number(yearStr), Number(monthStr), 0, 23, 59, 59, 999);

    const spendingAgg = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            ownerId: userId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$categoryId',
            spentPaise: { $sum: '$amountPaise' },
          },
        },
      ])
      .toArray();

    const spendingMap = new Map(spendingAgg.map((s) => [String(s._id), s.spentPaise]));

    let totalBudgetPaise = 0;
    let totalSpentPaise = 0;

    const enrichedBudgets = budgets.map((b) => {
      const catIdStr = String(b.categoryId);
      const spentPaise = spendingMap.get(catIdStr) || 0;
      const limitPaise = b.limitPaise || 0;
      const remainingPaise = Math.max(0, limitPaise - spentPaise);
      const percentageUsed = limitPaise > 0 ? Math.round((spentPaise / limitPaise) * 100) : 0;
      const isOverBudget = spentPaise > limitPaise;

      totalBudgetPaise += limitPaise;
      totalSpentPaise += spentPaise;

      return {
        id: b._id.toString(),
        month: b.month,
        categoryId: catIdStr,
        categoryName: b.category?.name || 'Category',
        categoryIcon: b.category?.icon || 'Tag',
        categoryColor: b.category?.color || '#F4D52E',
        limitPaise,
        limitRupees: toRupees(limitPaise),
        spentPaise,
        spentRupees: toRupees(spentPaise),
        remainingPaise,
        remainingRupees: toRupees(remainingPaise),
        percentageUsed,
        isOverBudget,
      };
    });

    return sendSuccess(res, {
      month: targetMonth,
      budgets: enrichedBudgets,
      summary: {
        totalBudgetPaise,
        totalBudgetRupees: toRupees(totalBudgetPaise),
        totalSpentPaise,
        totalSpentRupees: toRupees(totalSpentPaise),
        totalRemainingPaise: Math.max(0, totalBudgetPaise - totalSpentPaise),
        totalPercentageUsed:
          totalBudgetPaise > 0 ? Math.round((totalSpentPaise / totalBudgetPaise) * 100) : 0,
        overBudgetCount: enrichedBudgets.filter((b) => b.isOverBudget).length,
      },
    });
  },

  // POST /api/budgets (Upsert budget for category + month)
  async upsert(req, res) {
    const { categoryId, month, limit } = req.body || {};

    if (!categoryId || !ObjectId.isValid(categoryId)) {
      return sendError(res, 'Valid category ID is required', 400);
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 'Valid month format (YYYY-MM) is required', 400);
    }

    let limitPaise = 0;
    try {
      limitPaise = toPaise(limit);
      if (limitPaise <= 0) return sendError(res, 'Budget limit must be greater than zero', 400);
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    const db = getDb();
    const parsedCategoryId = new ObjectId(categoryId);

    // Verify category exists and belongs to user
    const category = await db.collection('categories').findOne({
      _id: parsedCategoryId,
      ownerId: req.user._id,
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    const updateResult = await db.collection('budgets').updateOne(
      {
        ownerId: req.user._id,
        categoryId: parsedCategoryId,
        month,
      },
      {
        $set: {
          limitPaise,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return sendSuccess(
      res,
      {
        categoryId,
        month,
        limitPaise,
        limitRupees: toRupees(limitPaise),
      },
      'Budget saved successfully'
    );
  },

  // DELETE /api/budgets/:id
  async delete(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid budget ID', 400);
    }

    const db = getDb();
    const result = await db.collection('budgets').deleteOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Budget not found', 404);
    }

    return sendSuccess(res, null, 'Budget deleted successfully');
  },
};
