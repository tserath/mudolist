import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  _id: false,
});

const listSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['list', 'note'],
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  items: {
    type: [itemSchema],
    default: [],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shared: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read',
    },
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
listSchema.index({ user: 1, type: 1 });
listSchema.index({ 'shared.user': 1 });

const List = mongoose.model('List', listSchema);

export default List;
