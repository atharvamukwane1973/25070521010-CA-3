import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toRupees } from '../utils/currency.js';
import { sendSuccess } from '../utils/response.js';

export const dashboardController = {
  // GET /api/dashboard/summary
  async getSummary(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Current month start & end
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Previous month start & end (for month-over-month comparison)
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Current Month Aggregations
    const monthStatsAgg = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            ownerId: userId,
            date: { $gte: startOfPrevMonth, $lte: endOfCurrentMonth },
          },
        },
        {
          $group: {
            _id: {
              type: '$type',
              isCurrentMonth: { $gte: ['$date', startOfCurrentMonth] },
            },
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    let curIncomePaise = 0;
    let curExpensePaise = 0;
    let prevIncomePaise = 0;
    let prevExpensePaise = 0;

    monthStatsAgg.forEach((stat) => {
      if (stat._id.isCurrentMonth) {
        if (stat._id.type === 'income') curIncomePaise = stat.totalPaise;
        if (stat._id.type === 'expense') curExpensePaise = stat.totalPaise;
      } else {
        if (stat._id.type === 'income') prevIncomePaise = stat.totalPaise;
        if (stat._id.type === 'expense') prevExpensePaise = stat.totalPaise;
      }
    });

    const netCashFlowPaise = curIncomePaise - curExpensePaise;
    const savingsRate =
      curIncomePaise > 0 ? Math.max(0, Math.round((netCashFlowPaise / curIncomePaise) * 100)) : 0;

    // Month-over-month percentage changes
    const incomeChangePct =
      prevIncomePaise > 0
        ? Math.round(((curIncomePaise - prevIncomePaise) / prevIncomePaise) * 100)
        : curIncomePaise > 0
        ? 100
        : 0;

    const expenseChangePct =
      prevExpensePaise > 0
        ? Math.round(((curExpensePaise - prevExpensePaise) / prevExpensePaise) * 100)
        : curExpensePaise > 0
        ? 100
        : 0;

    // 2. Total Net Worth across all accounts
    const accounts = await db.collection('accounts').find({ ownerId: userId }).toArray();

    const txAllAgg = await db
      .collection('transactions')
      .aggregate([
        { $match: { ownerId: userId } },
        {
          $facet: {
            inflow: [
              { $match: { type: 'income' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            outflow: [
              { $match: { type: 'expense' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            transfersOut: [
              { $match: { type: 'transfer' } },
              { $group: { _id: '$accountId', total: { $sum: '$amountPaise' } } },
            ],
            transfersIn: [
              { $match: { type: 'transfer' } },
              { $group: { _id: '$targetAccountId', total: { $sum: '$amountPaise' } } },
            ],
          },
        },
      ])
      .toArray();

    const stats = txAllAgg[0] || { inflow: [], outflow: [], transfersOut: [], transfersIn: [] };
    const inflowMap = new Map(stats.inflow.map((i) => [String(i._id), i.total]));
    const outflowMap = new Map(stats.outflow.map((o) => [String(o._id), o.total]));
    const xferOutMap = new Map(stats.transfersOut.map((t) => [String(t._id), t.total]));
    const xferInMap = new Map(stats.transfersIn.map((t) => [String(t._id), t.total]));

    let totalBalancePaise = 0;
    accounts.forEach((acc) => {
      const idStr = String(acc._id);
      const starting = Number(acc.startingBalancePaise || 0);
      const inVal = inflowMap.get(idStr) || 0;
      const outVal = outflowMap.get(idStr) || 0;
      const xOut = xferOutMap.get(idStr) || 0;
      const xIn = xferInMap.get(idStr) || 0;
      totalBalancePaise += starting + inVal - outVal - xOut + xIn;
    });

    // 3. Last 6 Months Spending Trend
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    const trendAgg = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            ownerId: userId,
            date: { $gte: sixMonthsAgo, $lte: endOfCurrentMonth },
            type: { $in: ['income', 'expense'] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            totalPaise: { $sum: '$amountPaise' },
          },
        },
      ])
      .toArray();

    // Build complete 6 month slots
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${String(y).slice(2)}`;

      const incRecord = trendAgg.find(
        (t) => t._id.year === y && t._id.month === m && t._id.type === 'income'
      );
      const expRecord = trendAgg.find(
        (t) => t._id.year === y && t._id.month === m && t._id.type === 'expense'
      );

      const incomePaise = incRecord ? incRecord.totalPaise : 0;
      const expensePaise = expRecord ? expRecord.totalPaise : 0;

      monthlyTrends.push({
        label,
        year: y,
        month: m,
        incomePaise,
        incomeRupees: toRupees(incomePaise),
        expensePaise,
        expenseRupees: toRupees(expensePaise),
        netPaise: incomePaise - expensePaise,
        netRupees: toRupees(incomePaise - expensePaise),
      });
    }

    // 4. Category-wise Spending Breakdown for Current Month
    const categoryBreakdownAgg = await db
      .collection('transactions')
      .aggregate([
        {
          $match: {
            ownerId: userId,
            type: 'expense',
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          },
        },
        {
          $group: {
            _id: '$categoryId',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaise: -1 } },
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

    const categoryBreakdown = categoryBreakdownAgg.map((c) => ({
      categoryId: c.category?._id?.toString() || 'unknown',
      name: c.category?.name || 'Uncategorized',
      icon: c.category?.icon || 'Tag',
      color: c.category?.color || '#F4D52E',
      spentPaise: c.totalPaise,
      spentRupees: toRupees(c.totalPaise),
      percent: curExpensePaise > 0 ? Math.round((c.totalPaise / curExpensePaise) * 100) : 0,
    }));

    // 5. Recent 6 Transactions
    const recentTransactionsAgg = await db
      .collection('transactions')
      .aggregate([
        { $match: { ownerId: userId } },
        { $sort: { date: -1, _id: -1 } },
        { $limit: 6 },
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
            type: 1,
            amountPaise: 1,
            currency: 1,
            date: 1,
            description: 1,
            merchant: 1,
            category: { $arrayElemAt: ['$category', 0] },
            account: { $arrayElemAt: ['$account', 0] },
          },
        },
      ])
      .toArray();

    const recentTransactions = recentTransactionsAgg.map((t) => ({
      id: t._id.toString(),
      type: t.type,
      amountPaise: t.amountPaise,
      amountRupees: toRupees(t.amountPaise),
      currency: t.currency || 'INR',
      date: t.date,
      description: t.description,
      merchant: t.merchant || '',
      categoryName: t.category?.name || 'Uncategorized',
      categoryIcon: t.category?.icon || 'Tag',
      categoryColor: t.category?.color || '#F4D52E',
      accountName: t.account?.name || 'Account',
    }));

    // 6. Savings Goals summary
    const goals = await db
      .collection('savings_goals')
      .find({ ownerId: userId })
      .limit(4)
      .toArray();

    const savingsGoals = goals.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      targetAmountPaise: g.targetAmountPaise,
      currentAmountPaise: g.currentAmountPaise,
      progressPercent:
        g.targetAmountPaise > 0
          ? Math.min(100, Math.round((g.currentAmountPaise / g.targetAmountPaise) * 100))
          : 0,
      targetDate: g.targetDate,
      status: g.status,
    }));

    return sendSuccess(res, {
      totalBalancePaise,
      totalBalanceRupees: toRupees(totalBalancePaise),
      currentMonthIncomePaise: curIncomePaise,
      currentMonthIncomeRupees: toRupees(curIncomePaise),
      currentMonthExpensePaise: curExpensePaise,
      currentMonthExpenseRupees: toRupees(curExpensePaise),
      netCashFlowPaise,
      netCashFlowRupees: toRupees(netCashFlowPaise),
      savingsRate,
      incomeChangePct,
      expenseChangePct,
      monthlyTrends,
      categoryBreakdown,
      recentTransactions,
      savingsGoals,
      hasRecords: accounts.length > 0 && (curIncomePaise > 0 || curExpensePaise > 0 || recentTransactions.length > 0),
    });
  },
};
