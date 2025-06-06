// models/Campaign.js
const mongoose = require('mongoose');

const PrizeSchema = new mongoose.Schema({
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
  probability: {
    type: Number,
    required: [true, 'Prize probability is required'],
    min: [0, 'Probability cannot be negative'],
    max: [100, 'Probability cannot exceed 100']
  },
  quantity: {
    type: Number,
    required: [true, 'Prize quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  remaining: {
    type: Number,
    required: [true, 'Remaining quantity is required'],
    min: [0, 'Remaining quantity cannot be negative'],
    validate: { // Đảm bảo remaining không lớn hơn quantity
        validator: function(value) {
            return value <= this.quantity;
        },
        message: 'Remaining quantity cannot exceed total quantity'
    }
  }
});

const CampaignSchema = new mongoose.Schema({
  title: { // Đã đổi từ 'name' trong form thành 'title' ở đây để nhất quán với model
    type: String,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: { // <-- THÊM TRƯỜNG NÀY
    type: String,
    default: ''
  },
  prizes: [PrizeSchema],
  spinsPerUser: {
    type: Number,
    default: 1,
    min: [1, 'Spins per user must be at least 1']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended', 'inactive', 'completed'], // <-- CẬP NHẬT ENUM
    default: 'draft'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', CampaignSchema);