import mongoose from 'mongoose';
import generateId from '../utils/generateId.js';

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => generateId()
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
});

const listSchema = new mongoose.Schema({
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
  pinned: {
    type: Boolean,
    default: false,
  },
  items: {
    type: [itemSchema],
    default: function() {
      return this.type === 'list' ? [] : undefined;
    },
    validate: {
      validator: function(v) {
        if (this.type === 'note') {
          return v === undefined || v.length === 0;
        }
        return true;
      },
      message: 'Notes cannot have items'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add virtual id field
listSchema.virtual('id').get(function() {
  return this._id;
});

const List = mongoose.model('List', listSchema);

export default List;
