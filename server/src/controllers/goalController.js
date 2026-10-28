import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { toPaise, toRupees } from '../utils/currency.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const goalController = {
  // GET /api/goals
  async list(req, res) {
    const db = getDb();
    const goals = await db
      .collection('savings_goals')
      .find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = goals.map((g) => {
      const targetPaise = Number(g.targetAmountPaise || 0);
      const currentPaise = Number(g.currentAmountPaise || 0);
      const remainingPaise = Math.max(0, targetPaise - currentPaise);
      const progressPercent =
        targetPaise > 0 ? Math.min(100, Math.round((currentPaise / targetPaise) * 100)) : 0;

      return {
        id: g._id.toString(),
        title: g.title,
        targetAmountPaise: targetPaise,
        targetAmountRupees: toRupees(targetPaise),
        currentAmountPaise: currentPaise,
        currentAmountRupees: toRupees(currentPaise),
        remainingAmountPaise: remainingPaise,
        remainingAmountRupees: toRupees(remainingPaise),
        progressPercent,
        targetDate: g.targetDate,
        category: g.category || 'General',
        status: currentPaise >= targetPaise ? 'completed' : g.status || 'in_progress',
        createdAt: g.createdAt,
      };
    });

    const totalTargetPaise = formatted.reduce((sum, g) => sum + g.targetAmountPaise, 0);
    const totalSavedPaise = formatted.reduce((sum, g) => sum + g.currentAmountPaise, 0);

    return sendSuccess(res, {
      goals: formatted,
      summary: {
        totalTargetPaise,
        totalTargetRupees: toRupees(totalTargetPaise),
        totalSavedPaise,
        totalSavedRupees: toRupees(totalSavedPaise),
        totalRemainingPaise: Math.max(0, totalTargetPaise - totalSavedPaise),
        overallProgressPercent:
          totalTargetPaise > 0 ? Math.round((totalSavedPaise / totalTargetPaise) * 100) : 0,
        activeGoalsCount: formatted.filter((g) => g.status !== 'completed').length,
        completedGoalsCount: formatted.filter((g) => g.status === 'completed').length,
      },
    });
  },

  // POST /api/goals
  async create(req, res) {
    const { title, targetAmount, currentAmount = 0, targetDate, category = 'General' } =
      req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return sendError(res, 'Goal title is required', 400);
    }

    let targetAmountPaise = 0;
    let currentAmountPaise = 0;

    try {
      targetAmountPaise = toPaise(targetAmount);
      if (targetAmountPaise <= 0) {
        return sendError(res, 'Target amount must be greater than zero', 400);
      }
      if (currentAmount) {
        currentAmountPaise = toPaise(currentAmount);
      }
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    const db = getDb();
    const newGoal = {
      ownerId: req.user._id,
      title: title.trim(),
      targetAmountPaise,
      currentAmountPaise,
      targetDate: targetDate ? new Date(targetDate) : null,
      category: category.trim(),
      status: currentAmountPaise >= targetAmountPaise ? 'completed' : 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('savings_goals').insertOne(newGoal);
    newGoal.id = result.insertedId.toString();

    return sendSuccess(res, newGoal, 'Savings goal created successfully', 201);
  },

  // POST /api/goals/:id/contribute
  async contribute(req, res) {
    const { id } = req.params;
    const { amount } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid goal ID', 400);
    }

    let contributionPaise = 0;
    try {
      contributionPaise = toPaise(amount);
      if (contributionPaise <= 0) {
        return sendError(res, 'Contribution amount must be greater than zero', 400);
      }
    } catch (err) {
      return sendError(res, err.message, 400);
    }

    const db = getDb();
    const goal = await db.collection('savings_goals').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }

    const newAmountPaise = (goal.currentAmountPaise || 0) + contributionPaise;
    const newStatus = newAmountPaise >= goal.targetAmountPaise ? 'completed' : goal.status;

    await db.collection('savings_goals').updateOne(
      { _id: new ObjectId(id), ownerId: req.user._id },
      {
        $set: {
          currentAmountPaise: newAmountPaise,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    return sendSuccess(
      res,
      {
        id,
        currentAmountPaise: newAmountPaise,
        currentAmountRupees: toRupees(newAmountPaise),
        status: newStatus,
      },
      'Contribution recorded towards savings goal'
    );
  },

  // PUT /api/goals/:id
  async update(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid goal ID', 400);
    }

    const { title, targetAmount, currentAmount, targetDate, category, status } = req.body || {};
    const db = getDb();

    const existing = await db.collection('savings_goals').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!existing) {
      return sendError(res, 'Goal not found', 404);
    }

    const updateFields = { updatedAt: new Date() };
    if (title && typeof title === 'string') updateFields.title = title.trim();
    if (category) updateFields.category = String(category).trim();
    if (status && ['in_progress', 'completed', 'paused'].includes(status)) {
      updateFields.status = status;
    }
    if (targetDate) {
      updateFields.targetDate = new Date(targetDate);
    }

    if (targetAmount !== undefined) {
      try {
        updateFields.targetAmountPaise = toPaise(targetAmount);
      } catch (err) {
        return sendError(res, err.message, 400);
      }
    }

    if (currentAmount !== undefined) {
      try {
        updateFields.currentAmountPaise = toPaise(currentAmount);
      } catch (err) {
        return sendError(res, err.message, 400);
      }
    }

    await db.collection('savings_goals').updateOne(
      { _id: new ObjectId(id), ownerId: req.user._id },
      { $set: updateFields }
    );

    return sendSuccess(res, null, 'Savings goal updated successfully');
  },

  // DELETE /api/goals/:id
  async delete(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid goal ID', 400);
    }

    const db = getDb();
    const result = await db.collection('savings_goals').deleteOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Goal not found', 404);
    }

    return sendSuccess(res, null, 'Goal deleted successfully');
  },
};
