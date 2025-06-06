const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { body, validationResult } = require('express-validator');

// Middleware validation cho spin wheel
const validateSpin = [
  body('campaignId')
    .notEmpty()
    .withMessage('Campaign ID is required')
    .isMongoId()
    .withMessage('Invalid Campaign ID format'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Phone number must be 10-11 digits'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
];

// POST /api/spin - Process wheel spin
router.post('/spin', validateSpin, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, campaignController.spinWheel);

module.exports = router;
