import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import List from '../models/List.js';

const router = express.Router();

// @route   GET /api/lists
// @desc    Get all lists for a user
// @access  Private
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const lists = await List.find({
      $or: [
        { user: req.user._id },
        { 'shared.user': req.user._id }
      ]
    }).sort({ updatedAt: -1 });
    res.json(lists);
  })
);

// @route   POST /api/lists
// @desc    Create a new list
// @access  Private
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const list = new List({
      ...req.body,
      user: req.user._id,
    });

    const createdList = await list.save();
    res.status(201).json(createdList);
  })
);

// @route   PUT /api/lists/:id
// @desc    Update a list
// @access  Private
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const list = await List.findOne({
      id: req.params.id,
      $or: [
        { user: req.user._id },
        {
          'shared.user': req.user._id,
          'shared.permission': 'write'
        }
      ]
    });

    if (list) {
      Object.assign(list, req.body);
      const updatedList = await list.save();
      res.json(updatedList);
    } else {
      res.status(404);
      throw new Error('List not found or no permission to edit');
    }
  })
);

// @route   DELETE /api/lists/:id
// @desc    Delete a list
// @access  Private
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const list = await List.findOne({
      id: req.params.id,
      user: req.user._id
    });

    if (list) {
      await list.remove();
      res.json({ message: 'List removed' });
    } else {
      res.status(404);
      throw new Error('List not found or no permission to delete');
    }
  })
);

// @route   POST /api/lists/:id/share
// @desc    Share a list with another user
// @access  Private
router.post(
  '/:id/share',
  protect,
  asyncHandler(async (req, res) => {
    const { userId, permission } = req.body;
    
    const list = await List.findOne({
      id: req.params.id,
      user: req.user._id
    });

    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }

    // Check if already shared
    const existingShare = list.shared.find(
      share => share.user.toString() === userId
    );

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      list.shared.push({ user: userId, permission });
    }

    const updatedList = await list.save();
    res.json(updatedList);
  })
);

// @route   DELETE /api/lists/:id/share/:userId
// @desc    Remove share access for a user
// @access  Private
router.delete(
  '/:id/share/:userId',
  protect,
  asyncHandler(async (req, res) => {
    const list = await List.findOne({
      id: req.params.id,
      user: req.user._id
    });

    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }

    list.shared = list.shared.filter(
      share => share.user.toString() !== req.params.userId
    );

    const updatedList = await list.save();
    res.json(updatedList);
  })
);

export default router;
