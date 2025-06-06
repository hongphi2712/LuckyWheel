const  express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// GET / - Home page
router.get('/', async (req, res) => {
  try {
    const activeCampaigns = await Campaign.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.render('index', {
      title: 'Home',
      activeCampaigns
    });
  } catch (err) {
    console.error(err);
    res.render('index', {
      title: 'Home',
      activeCampaigns: []
    });
  }
});

module.exports = router;
 