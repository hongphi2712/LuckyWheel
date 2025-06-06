const  express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

// GET /campaigns - Get all active campaigns
router.get('/', campaignController.getAllCampaigns);

// GET /campaigns/:id - Get campaign details and spin page
router.get('/:id', campaignController.getCampaignDetails);

// GET /campaigns/result/:id - Get spin result details
router.get('/result/:id', campaignController.getSpinResult);

module.exports = router;
 