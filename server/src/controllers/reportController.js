import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toRupees } from '../utils/currency.js';
import { sendSuccess } from '../utils/response.js';

export const reportController = {
  // GET /api/reports/analytics
  async getAnalytics(req, res) {
    const db = getDb();
    const userId = req.user._id;

    // Default to last 30 days if range not specified
    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);

    const startDate = req.query.startDate ? new Date(req.query.startDate) : defaultStart;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : now;
    endDate.setHours(23, 59, 59, 999);

    const matchDateFilter = {
      ownerId: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    // 1. Totals by Type
    const totalsAgg = await db
      .collection('transactions')
      .aggregate([
        { $match: matchDateFilter },
        {
          $group: {
            _id: '$type',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    let totalIncomePaise = 0;
    let totalExpensePaise = 0;
    totalsAgg.forEach((t) => {
      if (t._id === 'income') totalIncomePaise = t.totalPaise;
      if (t._id === 'expense') totalExpensePaise = t.totalPaise;
    });

    const netSavingsPaise = totalIncomePaise - totalExpensePaise;
    const daysDiff = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const avgDailyExpensePaise = Math.round(totalExpensePaise / daysDiff);

    // 2. Top Spending Categories
    const topCategoriesAgg = await db
      .collection('transactions')
      .aggregate([
        { $match: { ...matchDateFilter, type: 'expense' } },
        {
          $group: {
            _id: '$categoryId',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaise: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $project: {
            totalPaise: 1,
            count: 1,
            category: { $arrayElemAt: ['$category', 0] },
          },
        },
      ])
      .toArray();

    const topCategories = topCategoriesAgg.map((c) => ({
      categoryId: c.category?._id?.toString() || 'unknown',
      name: c.category?.name || 'Uncategorized',
      icon: c.category?.icon || 'Tag',
      color: c.category?.color || '#F4D52E',
      totalPaise: c.totalPaise,
      totalRupees: toRupees(c.totalPaise),
      percentage: totalExpensePaise > 0 ? Math.round((c.totalPaise / totalExpensePaise) * 100) : 0,
      transactionCount: c.count,
    }));

    // 3. Top Merchants
    const topMerchantsAgg = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            ...matchDateFilter,
            type: 'expense',
            merchant: { $exists: true, $ne: '' },
          },
        },
        {
          $group: {
            _id: '$merchant',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaise: -1 } },
        { $limit: 8 },
      ])
      .toArray();

    const topMerchants = topMerchantsAgg.map((m) => ({
      merchant: m._id,
      totalPaise: m.totalPaise,
      totalRupees: toRupees(m.totalPaise),
      count: m.count,
    }));

    return sendSuccess(res, {
      dateRange: {
        startDate,
        endDate,
        days: daysDiff,
      },
      totals: {
        incomePaise: totalIncomePaise,
        incomeRupees: toRupees(totalIncomePaise),
        expensePaise: totalExpensePaise,
        expenseRupees: toRupees(totalExpensePaise),
        netSavingsPaise,
        netSavingsRupees: toRupees(netSavingsPaise),
        avgDailyExpensePaise,
        avgDailyExpenseRupees: toRupees(avgDailyExpensePaise),
      },
      topCategories,
      topMerchants,
    });
  },
};
