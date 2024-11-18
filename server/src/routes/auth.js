import express from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

// @route   PUT /api/auth/settings
// @desc    Update user settings
// @access  Private
router.put(
  '/settings',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.settings = {
        ...user.settings,
        ...req.body,
      };

      const updatedUser = await user.save();

      res.json({
        settings: updatedUser.settings,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

export default router;
