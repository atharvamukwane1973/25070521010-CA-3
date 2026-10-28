import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const categoryController = {
  // GET /api/categories
  async list(req, res) {
    const db = getDb();
    const categories = await db
      .collection('categories')
      .find({ ownerId: req.user._id })
      .sort({ type: 1, name: 1 })
      .toArray();

    return sendSuccess(
      res,
      categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        type: c.type,
        icon: c.icon || 'Tag',
        color: c.color || '#F4D52E',
        isDefault: Boolean(c.isDefault),
        createdAt: c.createdAt,
      }))
    );
  },

  // POST /api/categories
  async create(req, res) {
    const { name, type = 'expense', icon = 'Tag', color = '#F4D52E' } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'Category name is required', 400);
    }

    if (!['income', 'expense'].includes(type)) {
      return sendError(res, 'Category type must be "income" or "expense"', 400);
    }

    const db = getDb();

    // Check duplicate name for this owner
    const existing = await db.collection('categories').findOne({
      ownerId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type,
    });

    if (existing) {
      return sendError(res, `A ${type} category named "${name.trim()}" already exists`, 409);
    }

    const newCategory = {
      ownerId: req.user._id,
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(newCategory);
    newCategory.id = result.insertedId.toString();

    return sendSuccess(res, newCategory, 'Category created successfully', 201);
  },

  // PUT /api/categories/:id
  async update(req, res) {
    const { id } = req.params;
    const { name, icon, color } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid category ID', 400);
    }

    const db = getDb();
    const existing = await db.collection('categories').findOne({
      _id: new ObjectId(id),
      ownerId: req.user._id,
    });

    if (!existing) {
      return sendError(res, 'Category not found', 404);
    }

    const updateFields = { updatedAt: new Date() };
    if (name && typeof name === 'string') updateFields.name = name.trim();
    if (icon) updateFields.icon = icon;
    if (color) updateFields.color = color;

    await db.collection('categories').updateOne(
      { _id: new ObjectId(id), ownerId: req.user._id },
      { $set: updateFields }
    );

    return sendSuccess(res, null, 'Category updated successfully');
  },

  // DELETE /api/categories/:id
  async delete(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Invalid category ID', 400);
    }

    const db = getDb();
    const categoryId = new ObjectId(id);

    // Check usage in transactions
    const txCount = await db.collection('transactions').countDocuments({
      ownerId: req.user._id,
      categoryId,
    });

    if (txCount > 0) {
      return sendError(
        res,
        `Cannot delete category: it is referenced by ${txCount} transaction(s). Reassign transactions first.`,
        409
      );
    }

    // Check usage in budgets
    await db.collection('budgets').deleteMany({
      ownerId: req.user._id,
      categoryId,
    });

    const deleteResult = await db.collection('categories').deleteOne({
      _id: categoryId,
      ownerId: req.user._id,
    });

    if (deleteResult.deletedCount === 0) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, null, 'Category deleted successfully');
  },
};
