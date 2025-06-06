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
  prize: { // Đảm bảo cấu trúc này khớp
    id: { // ID của giải thưởng trong mảng prizes của Campaign
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
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    // ... validators ...
  },
  guestName: {
    type: String,
    default: '',
    trim: true
  },
  isGuest: {
    type: Boolean,
    default: function() { return !this.user; }
  },
  // spinTime: { type: Date, default: Date.now }, // Bạn có thể dùng createdAt
}, {
  timestamps: true // Sẽ tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('SpinResult', SpinResultSchema);