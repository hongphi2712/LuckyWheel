const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard routes
router.get('/', adminController.getDashboard);           // /admin/
router.get('/dashboard', adminController.getDashboard);  // /admin/dashboard

// Campaign routes
router.get('/campaigns', adminController.getAllCampaigns);
router.get('/campaigns/create', adminController.getCreateCampaign);
router.post('/campaigns/create', adminController.createCampaign);
router.get('/campaigns/edit/:id', adminController.getEditCampaign);
router.put('/campaigns/edit/:id', adminController.updateCampaign);
router.delete('/campaigns/:id', adminController.deleteCampaign);

// Report routes
router.get('/reports', adminController.getReports);

// User routes
router.get('/users', adminController.getUsers);

module.exports = router;
