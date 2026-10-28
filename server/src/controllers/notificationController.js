import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toRupees } from '../utils/currency.js';
import { sendSuccess } from '../utils/response.js';

export const notificationController = {
  // GET /api/notifications
  async list(req, res) {
    const db = getDb();
    const userId = req.user._id;

    const notifications = [];
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Check Budgets nearing limit or over limit
    const budgets = await db
      .collection('budgets')
      .aggregate([
        { $match: { ownerId: userId, month: currentMonth } },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
      ])
      .toArray();

    if (budgets.length > 0) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

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

      budgets.forEach((b) => {
        const spentPaise = spendingMap.get(String(b.categoryId)) || 0;
        const limitPaise = b.limitPaise || 0;
        const catName = b.category?.[0]?.name || 'Category';

        if (limitPaise > 0) {
          const pct = Math.round((spentPaise / limitPaise) * 100);
          if (pct >= 100) {
            notifications.push({
              id: `budget-over-${b._id}`,
              type: 'danger',
              title: `Budget Exceeded: ${catName}`,
              message: `You've spent ₹${toRupees(spentPaise).toLocaleString('en-IN')} of your ₹${toRupees(limitPaise).toLocaleString('en-IN')} budget (${pct}%).`,
              timestamp: now,
              actionUrl: '/app/budgets',
            });
          } else if (pct >= 85) {
            notifications.push({
              id: `budget-warn-${b._id}`,
              type: 'warning',
              title: `Budget Warning: ${catName}`,
              message: `You've consumed ${pct}% of your monthly ${catName} budget limit.`,
              timestamp: now,
              actionUrl: '/app/budgets',
            });
          }
        }
      });
    }

    // 2. Check Upcoming Recurring Transactions (due in next 5 days)
    const inFiveDays = new Date(now);
    inFiveDays.setDate(inFiveDays.getDate() + 5);

    const upcomingRecurring = await db
      .collection('recurring_transactions')
      .find({
        ownerId: userId,
        active: true,
        nextDueDate: { $gte: now, $lte: inFiveDays },
      })
      .toArray();

    upcomingRecurring.forEach((r) => {
      const daysLeft = Math.ceil((new Date(r.nextDueDate) - now) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `recurring-due-${r._id}`,
        type: 'info',
        title: `Upcoming Payment: ${r.description}`,
        message: `₹${toRupees(r.amountPaise).toLocaleString('en-IN')} due ${daysLeft === 0 ? 'today' : `in ${daysLeft} day(s)`}.`,
        timestamp: r.nextDueDate,
        actionUrl: '/app/recurring',
      });
    });

    // 3. Check Completed Goals
    const completedGoals = await db
      .collection('savings_goals')
      .find({
        ownerId: userId,
        status: 'completed',
      })
      .limit(3)
      .toArray();

    completedGoals.forEach((g) => {
      notifications.push({
        id: `goal-complete-${g._id}`,
        type: 'success',
        title: `Goal Achieved: ${g.title}!`,
        message: `Congratulations! You've successfully reached your target of ₹${toRupees(g.targetAmountPaise).toLocaleString('en-IN')}.`,
        timestamp: g.updatedAt || g.createdAt,
        actionUrl: '/app/goals',
      });
    });

    return sendSuccess(res, {
      notifications,
      unreadCount: notifications.length,
    });
  },
};
