const  Campaign = require('../models/Campaign');
const User = require('../models/User');
const SpinResult = require('../models/SpinResult');

// Get all active campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'active' })
      .sort({ createdAt: -1 });
    
    res.render('campaigns/list', {
      title: 'Available Campaigns',
      campaigns
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching campaigns');
    res.redirect('/');
  }
};

// Get campaign details for spinning
exports.getCampaignDetails = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      req.flash('error_msg', 'Campaign not found');
      return res.redirect('/campaigns');
    }
    
    // Check if campaign is active
    if (campaign.status !== 'active') {
      req.flash('error_msg', 'This campaign is not currently active');
      return res.redirect('/campaigns');
    }
    
    // Check if user has remaining spins
    let canSpin = true;
    let remainingSpins = campaign.spinsPerUser;
    
    if (req.session.user) {
      // For logged in users
      const spinCount = await SpinResult.countDocuments({
        campaign: campaign._id,
        user: req.session.user.id
      });
      
      remainingSpins = Math.max(0, campaign.spinsPerUser - spinCount);
      canSpin = remainingSpins > 0;
    } else {
      // For guest users with phone stored in session
      const userPhone = req.query.phone || '';
      
      if (userPhone) {
        const spinCount = await SpinResult.countDocuments({
          campaign: campaign._id,
          phone: userPhone
        });
        
        remainingSpins = Math.max(0, campaign.spinsPerUser - spinCount);
        canSpin = remainingSpins > 0;
      }
    }
    
    res.render('campaigns/spin', {
      title: campaign.name,
      campaign,
      canSpin,
      remainingSpins
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving campaign details');
    res.redirect('/campaigns');
  }
};

// Get spin result details
exports.getSpinResult = async (req, res) => {
  try {
    const result = await SpinResult.findById(req.params.id)
      .populate('campaign')
      .populate('user');
    
    if (!result) {
      req.flash('error_msg', 'Result not found');
      return res.redirect('/campaigns');
    }
    
    res.render('campaigns/result', {
      title: 'Prize Result',
      result
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error retrieving result');
    res.redirect('/campaigns');
  }
};

// Process wheel spin API
exports.spinWheel = async (req, res) => {
  try {
    const { campaignId, phone, name } = req.body;

    // Validate required fields
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required'
      });
    }

    // Get campaign
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not currently active'
      });
    }

    if (!campaign.prizes || campaign.prizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No prizes available for this campaign'
      });
    }

    // Identify user
    let userId = null;
    let userPhone = '';

    if (req.session.user) {
      userId = req.session.user.id;
      userPhone = req.session.user.phone;

      // Thêm kiểm tra số điện thoại cho user đăng nhập
      if (!userPhone) {
        return res.status(400).json({
          success: false,
          message: 'User phone number not found in session. Please update your profile or provide a phone number.'
        });
      }
    } else {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required for guest users.'
        });
      }
      userPhone = phone;

      let user = await User.findOne({ phone: userPhone });
      if (!user && name) {
        user = new User({
          name: name,
          phone: userPhone
        });
        await user.save();
        userId = user._id;
      } else if (user) {
        userId = user._id;
      }
    }

    // Đảm bảo userPhone đã có giá trị
    if (!userPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    // Check if user has remaining spins
    const spinCount = await SpinResult.countDocuments({
      campaign: campaignId,
      phone: userPhone
    });

    if (spinCount >= campaign.spinsPerUser) {
      return res.status(400).json({
        success: false,
        message: `You have already used all ${campaign.spinsPerUser} spin(s) for this campaign. Thank you for participating!`,
        errorType: 'SPINS_EXHAUSTED', // Thêm type để frontend xử lý
        spinsUsed: spinCount,
        maxSpins: campaign.spinsPerUser
      });
    }

    // Find available prizes (with remaining quantity)
    const availablePrizes = campaign.prizes.filter(prize => prize.remaining > 0);

    if (availablePrizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No more prizes available'
      });
    }

    // Calculate prize based on probability
    let selectedPrize = null;
    const totalProbability = availablePrizes.reduce((sum, prize) => sum + prize.probability, 0);
    const normalizedPrizes = availablePrizes.map(prize => ({
      ...prize.toObject(),
      probability: (prize.probability / totalProbability) * 100
    }));

    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const prize of normalizedPrizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    if (!selectedPrize && normalizedPrizes.length > 0) {
      selectedPrize = normalizedPrizes[normalizedPrizes.length - 1];
    }

    await Campaign.updateOne(
      { _id: campaignId, 'prizes._id': selectedPrize._id },
      { $inc: { 'prizes.$.remaining': -1 } }
    );

    const spinResult = new SpinResult({
      user: userId,
      campaign: campaignId,
      prize: {
        id: selectedPrize._id,
        name: selectedPrize.name,
        image: selectedPrize.image
      },
      phone: userPhone
    });

    await spinResult.save();

    return res.json({
      success: true,
      prize: {
        id: selectedPrize._id,
        name: selectedPrize.name,
        color: selectedPrize.color,
        image: selectedPrize.image
      },
      resultId: spinResult._id,
      spinsUsed: spinCount + 1, // Số lượt đã sử dụng sau khi quay
      maxSpins: campaign.spinsPerUser
    });
  } catch (err) {
    console.error('Spin wheel error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check your input.',
        errors: err.errors
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};
