const Campaign = require('../models/Campaign');
const User = require('../models/User');
const SpinResult = require('../models/SpinResult');
// const Admin = require('../models/Admin'); // Bỏ comment nếu bạn dùng

exports.getDashboard = async (req, res) => {
  try {
    const campaignsCount = await Campaign.countDocuments();
    const usersCount = await User.countDocuments();
    const spinsCount = await SpinResult.countDocuments();
    const recentCampaigns = await Campaign.find().sort({ createdAt: -1 }).limit(5);
    const recentSpins = await SpinResult.find().populate('user', 'name').populate('campaign', 'title').sort({ createdAt: -1 }).limit(5); // Sửa campaign 'name' thành 'title'

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      layout: 'layouts/admin',
      stats: {
        campaigns: campaignsCount,
        users: usersCount,
        spins: spinsCount,
        prizes: spinsCount
      },
      recentCampaigns,
      recentSpins
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    req.flash('error_msg', 'Failed to load dashboard');
    res.redirect('/');
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.render('admin/campaigns/index', {
      title: 'Manage Campaigns',
      layout: 'layouts/admin',
      campaigns
    });
  } catch (err) {
    console.error('GetAllCampaigns Error:', err);
    req.flash('error_msg', 'Failed to fetch campaigns');
    res.redirect('/admin/dashboard');
  }
};

exports.getCreateCampaign = (req, res) => {
  res.render('admin/campaigns/create', {
    title: 'Create Campaign',
    layout: 'layouts/admin',
    campaign: {} // Truyền một campaign rỗng để form không bị lỗi undefined
  });
};

exports.createCampaign = async (req, res) => {
  try {
    const data = req.body;
    let prizes = [];

    if (data.prizes && Array.isArray(data.prizes)) {
      prizes = data.prizes.map(prize => ({
        name: prize.name,
        color: prize.color || '#FF6384',
        probability: Number(prize.probability) || 0,
        quantity: Number(prize.quantity) || 0,
        remaining: Number(prize.quantity) || 0,
        image: prize.image || '',
        isWinner: !!prize.isWinner // Chuyển checkbox thành boolean
      })).filter(prize => prize.name);
    }

    const campaign = new Campaign({
      title: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      spinsPerUser: Number(data.spinsPerUser) || 1,
      prizes
    });

    await campaign.save();
    req.flash('success_msg', 'Campaign created successfully');
    res.redirect('/admin/campaigns');
  } catch (error) {
    console.error('Create campaign error:', error);
    req.flash('error_msg', 'Error creating campaign');
    res.render('admin/campaigns/create', { error_msg: req.flash('error_msg') });
  }
};

exports.getEditCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      req.flash('error_msg', 'Campaign not found');
      return res.redirect('/admin/campaigns');
    }
    res.render('admin/campaigns/edit', {
      title: 'Edit Campaign',
      layout: 'layouts/admin',
      campaign
    });
  } catch (err) {
    console.error('GetEditCampaign Error:', err);
    req.flash('error_msg', 'Failed to fetch campaign');
    res.redirect('/admin/campaigns');
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const data = req.body;
    let prizes = [];

    if (data.prizes && Array.isArray(data.prizes)) {
      prizes = data.prizes.map(prizeData => {
        const newPrize = {
          name: prizeData.name,
          color: prizeData.color || '#FF6384',
          probability: Number(prizeData.probability) || 0,
          quantity: Number(prizeData.quantity) || 0,
          remaining: (typeof prizeData.remaining !== 'undefined') ? Number(prizeData.remaining) : Number(prizeData.quantity),
          image: prizeData.image || '',
          isWinner: !!prizeData.isWinner // Chuyển checkbox thành boolean
        };
        
        if (prizeData.id && prizeData.id.trim() !== '') {
          newPrize._id = prizeData.id;
        }
        return newPrize;
      }).filter(prize => prize.name);
    }

    await Campaign.findByIdAndUpdate(req.params.id, {
      title: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      spinsPerUser: Number(data.spinsPerUser) || 1,
      prizes
    });

    req.flash('success_msg', 'Campaign updated successfully');
    res.redirect('/admin/campaigns');
  } catch (error) {
    console.error('Update campaign error:', error);
    req.flash('error_msg', 'Error updating campaign');
    res.redirect(`/admin/campaigns/edit/${req.params.id}`);
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
        req.flash('error_msg', 'Campaign not found.');
        return res.redirect('/admin/campaigns');
    }
    req.flash('success_msg', 'Campaign deleted successfully');
    res.redirect('/admin/campaigns');
  } catch (err) {
    console.error('DeleteCampaign Error:', err);
    req.flash('error_msg', 'Failed to delete campaign');
    res.redirect('/admin/campaigns');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', {
      title: 'Manage Users',
      layout: 'layouts/admin',
      users
    });
  } catch (err) {
    console.error('GetUsers Error:', err);
    req.flash('error_msg', 'Failed to fetch users');
    res.redirect('/admin/dashboard');
  }
};

exports.getReports = async (req, res) => {
  try {
    const spinResults = await SpinResult.find()
      .populate('user', 'name phone')
      .populate('campaign', 'name')
      .sort({ createdAt: -1 });
    
    res.render('admin/reports', {
      title: 'Reports',
      layout: 'layouts/admin',
      spinResults
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to fetch reports');
    res.redirect('/admin/dashboard');
  }
};
