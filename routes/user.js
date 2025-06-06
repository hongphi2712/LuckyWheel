const  express = require('express');
const router = express.Router();
const { forwardAuthenticated, ensureAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/authController');
const SpinResult = require('../models/SpinResult');

router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('user/login', { 
    title: 'Admin Login',
    layout: 'layouts/main'
  });
});

router.post('/login', authController.loginUser);

router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('user/register', { 
    title: 'Admin Registration',
    layout: 'layouts/main'
  });
});

router.post('/register', authController.registerAdmin);

router.get('/logout', authController.logoutUser);

router.get('/enter-phone', (req, res) => {
  const campaignId = req.query.campaign;
  if (!campaignId) {
    return res.redirect('/campaigns');
  }
  
  res.render('user/enter-phone', {
    title: 'Enter Phone Number',
    layout: 'layouts/main',
    campaignId
  });
});

router.post('/register-api', authController.registerUser);

router.get('/history', async (req, res) => {
  try {
    const phone = req.query.phone;
    
    if (!phone) {
      return res.render('user/history', {
        title: 'Spin History',
        layout: 'layouts/main',
        results: [],
        phone: null
      });
    }
    
    const results = await SpinResult.find({ phone })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    
    res.render('user/history', {
      title: 'Spin History',
      layout: 'layouts/main',
      results,
      phone
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to fetch history');
    res.redirect('/campaigns');
  }
});

module.exports = router;
 