// models/SpinResult.js
const mongoose = require('mongoose');

const SpinResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: [true, 'Campaign is required']
  },
  prize: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Prize ID is required']
    },
    name: {
      type: String,
      required: [true, 'Prize name is required'],
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#FF6384'
    },
    isWinner: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  guestName: {
    type: String,
    default: '',
    trim: true
  },
  isGuest: {
    type: Boolean,
    default: function() { return !this.user; }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SpinResult', SpinResultSchema);