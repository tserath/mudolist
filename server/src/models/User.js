import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  settings: {
    theme: {
      type: String,
      default: 'light',
    },
    defaultItemType: {
      type: String,
      default: 'list',
    },
    viewLayout: {
      type: String,
      default: 'grid',
    },
    sortOrder: {
      type: String,
      default: 'newest',
    },
    viewDensity: {
      type: String,
      default: 'comfortable',
    },
    showCompleted: {
      type: Boolean,
      default: true,
    },
    autoSaveInterval: {
      type: Number,
      default: 30,
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
