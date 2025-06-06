const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10,11}$/.test(v);
      },
      message: 'Phone number must be 10-11 digits'
    }
  },
  email: {
    type: String,
    sparse: true, // Cho phép null/undefined nhưng unique nếu có
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSpins: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model('User', UserSchema);
