import express from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import List from '../models/List.js';
import generateId from '../utils/generateId.js';

const router = express.Router();

// @route   GET /api/lists
// @desc    Get all lists for a user
// @access  Private
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const lists = await List.find({
        $or: [
          { user: req.user._id },
          { 'shared.user': req.user._id }
        ]
      }).sort({ pinned: -1, updatedAt: -1 });
      res.json(lists);
    } catch (error) {
      console.error('Error getting lists:', error);
      res.status(500);
      throw error;
    }
  })
);

// @route   POST /api/lists
// @desc    Create a new list
// @access  Private
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { type, title, content } = req.body;
      
      // Validate type
      if (!type || !['list', 'note'].includes(type)) {
        res.status(400);
        throw new Error('Invalid type specified');
      }

      const list = new List({
        title,
        type,
        content: type === 'note' ? (content || '') : undefined,
        items: type === 'list' ? [] : undefined,
        user: req.user._id,
      });

      const createdList = await list.save();
      res.status(201).json(createdList);
    } catch (error) {
      console.error('Error creating list:', error);
      res.status(500);
      throw error;
    }
  })
);

// @route   PUT /api/lists/:id
// @desc    Update a list
// @access  Private
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const list = await List.findOne({
        $and: [
          {
            $or: [
              { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : req.params.id },
              { id: req.params.id }
            ]
          },
          {
            $or: [
              { user: req.user._id },
              {
                'shared.user': req.user._id,
                'shared.permission': 'write'
              }
            ]
          }
        ]
      });

      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to update');
      }

      // Ensure we're not mixing types
      if (req.body.type && req.body.type !== list.type) {
        res.status(400);
        throw new Error('Cannot change item type');
      }

      // Update allowed fields based on type
      if (list.type === 'note') {
        const allowedUpdates = ['title', 'content'];
        Object.keys(req.body).forEach(field => {
          if (!allowedUpdates.includes(field)) {
            delete req.body[field];
          }
        });
      } else if (list.type === 'list') {
        const allowedUpdates = ['title', 'items'];
        Object.keys(req.body).forEach(field => {
          if (!allowedUpdates.includes(field)) {
            delete req.body[field];
          }
        });
      }

      // Apply updates
      Object.assign(list, req.body);
      const updatedList = await list.save();
      res.json(updatedList);
    } catch (error) {
      console.error('Error updating list:', error);
      res.status(error.status || 500);
      throw error;
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
    try {
      const list = await List.findOne({
        _id: req.params.id,
        user: req.user._id // Only owner can delete
      });

      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to delete');
      }

      await List.deleteOne({ _id: req.params.id });
      res.json({ message: `${list.type === 'note' ? 'Note' : 'List'} removed` });
    } catch (error) {
      console.error('Error deleting list:', error);
      res.status(error.status || 500);
      throw error;
    }
  })
);

// @route   POST /api/lists/:id/items
// @desc    Add an item to a list
// @access  Private
router.post(
  '/:id/items',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const list = await List.findOne({
        $and: [
          {
            $or: [
              { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : req.params.id },
              { id: req.params.id }
            ]
          },
          {
            $or: [
              { user: req.user._id },
              {
                'shared.user': req.user._id,
                'shared.permission': 'write'
              }
            ]
          }
        ]
      });
      
      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to modify');
      }

      // Only allow adding items to lists
      if (list.type !== 'list') {
        res.status(400);
        throw new Error('Cannot add items to a note');
      }

      const newItem = {
        id: generateId(),
        text: req.body.text,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      list.items = list.items || [];
      list.items.push(newItem);
      await list.save();

      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error adding item:', error);
      res.status(error.status || 500);
      throw error;
    }
  })
);

// @route   PUT /api/lists/:id/items/:itemId
// @desc    Update an item in a list
// @access  Private
router.put(
  '/:id/items/:itemId',
  protect,
  asyncHandler(async (req, res) => {
    try {
      console.log('=== START UPDATE ITEM ===');
      console.log('Request params:', {
        listId: req.params.id,
        itemId: req.params.itemId,
        body: req.body
      });

      const listId = mongoose.Types.ObjectId.isValid(req.params.id) 
        ? new mongoose.Types.ObjectId(req.params.id)
        : null;

      console.log('Parsed listId:', listId);

      if (!listId) {
        res.status(400);
        throw new Error('Invalid list ID format');
      }

      const list = await List.findOne({
        _id: listId,
        $or: [
          { user: req.user._id },
          { 
            'shared.user': req.user._id,
            'shared.permission': 'write'
          }
        ]
      });

      console.log('Found list:', {
        found: !!list,
        id: list?._id,
        itemCount: list?.items?.length,
        items: list?.items?.map(i => ({ id: i.id, text: i.text }))
      });

      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to modify');
      }

      // Only allow updating items in lists
      if (list.type !== 'list') {
        res.status(400);
        throw new Error('Cannot update items in a note');
      }

      console.log('Looking for item:', {
        itemId: req.params.itemId,
        itemIds: list.items.map(i => i.id)
      });

      const itemIndex = list.items.findIndex(item => item.id === req.params.itemId);
      console.log('Found item index:', itemIndex);

      if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found');
      }

      // Preserve existing item data and only update allowed fields
      const existingItem = list.items[itemIndex];
      console.log('Existing item:', existingItem);

      list.items[itemIndex] = {
        ...existingItem,
        completed: req.body.completed ?? existingItem.completed,
        text: req.body.text ?? existingItem.text,
      };

      console.log('Updated item:', list.items[itemIndex]);

      await list.save();
      console.log('=== END UPDATE ITEM ===');
      res.json(list.items[itemIndex]);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(error.status || 500);
      throw error;
    }
  })
);

// @route   DELETE /api/lists/:id/items/:itemId
// @desc    Delete an item from a list
// @access  Private
router.delete(
  '/:id/items/:itemId',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const list = await List.findOne({
        $and: [
          {
            $or: [
              { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? new mongoose.Types.ObjectId(req.params.id) : req.params.id },
              { id: req.params.id }
            ]
          },
          {
            $or: [
              { user: req.user._id },
              {
                'shared.user': req.user._id,
                'shared.permission': 'write'
              }
            ]
          }
        ]
      });

      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to modify');
      }

      // Only allow deleting items from lists
      if (list.type !== 'list') {
        res.status(400);
        throw new Error('Cannot delete items from a note');
      }

      const itemIndex = list.items.findIndex(item => item.id === req.params.itemId);
      if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found');
      }

      list.items.splice(itemIndex, 1);
      await list.save();
      res.json({ message: 'Item removed' });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500);
      throw error;
    }
  })
);

// Reorder items endpoint
router.put(
  '/:id/reorder',
  protect,
  asyncHandler(async (req, res) => {
    try {
      console.log('=== START REORDER ITEMS ===');
      console.log('Request:', {
        listId: req.params.id,
        body: req.body
      });

      const listId = mongoose.Types.ObjectId.isValid(req.params.id) 
        ? new mongoose.Types.ObjectId(req.params.id)
        : null;

      if (!listId) {
        res.status(400);
        throw new Error('Invalid list ID format');
      }

      const list = await List.findOne({
        _id: listId,
        $or: [
          { user: req.user._id },
          { 
            'shared.user': req.user._id,
            'shared.permission': 'write'
          }
        ]
      });

      if (!list) {
        res.status(404);
        throw new Error('List not found or no permission to modify');
      }

      const { sourceIndex, destinationIndex } = req.body;
      console.log('Reordering:', { sourceIndex, destinationIndex, itemCount: list.items.length });

      if (sourceIndex < 0 || sourceIndex >= list.items.length || 
          destinationIndex < 0 || destinationIndex >= list.items.length) {
        res.status(400);
        throw new Error('Invalid source or destination index');
      }

      // Perform the reorder
      const [item] = list.items.splice(sourceIndex, 1);
      list.items.splice(destinationIndex, 0, item);

      await list.save();
      console.log('=== END REORDER ITEMS ===');
      res.json(list);
    } catch (error) {
      console.error('Error reordering items:', error);
      res.status(error.status || 500);
      throw error;
    }
  })
);

// @route   PATCH /api/lists/:id/pin
// @desc    Toggle pin status of a list or note
// @access  Private
router.patch(
  '/:id/pin',
  protect,
  asyncHandler(async (req, res) => {
    try {
      const list = await List.findOne({
        _id: req.params.id,
        $or: [
          { user: req.user._id },
          { 'shared.user': req.user._id }
        ]
      });

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      // Toggle the pinned status
      list.pinned = !list.pinned;
      const savedList = await list.save();

      res.json(savedList);
    } catch (error) {
      console.error('Error toggling pin status:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to toggle pin status'
      });
    }
  })
);

export default router;
