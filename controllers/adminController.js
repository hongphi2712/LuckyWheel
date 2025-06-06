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
        remaining: Number(prize.quantity) || 0, // Khi tạo mới, remaining = quantity
        image: prize.image || ''
      })).filter(prize => prize.name); // Lọc bỏ giải thưởng không có tên (trường hợp form rỗng)
    } else if (data.prizes && typeof data.prizes === 'object' && data.prizes.name) {
      // Trường hợp chỉ có 1 giải thưởng và form không gửi dưới dạng mảng
      prizes = [{
        name: data.prizes.name,
        color: data.prizes.color || '#FF6384',
        probability: Number(data.prizes.probability) || 0,
        quantity: Number(data.prizes.quantity) || 0,
        remaining: Number(data.prizes.quantity) || 0,
        image: data.prizes.image || ''
      }];
    }

    if (prizes.length === 0) {
        req.flash('error_msg', 'Campaign must have at least one prize.');
        return res.render('admin/campaigns/create', { // Render lại form với dữ liệu đã nhập
            title: 'Create Campaign',
            layout: 'layouts/admin',
            campaign: data, // gửi lại data cũ
            error_msg: 'Campaign must have at least one prize.'
        });
    }

    const campaign = new Campaign({
      title: data.name, // Lấy từ form input name="name"
      description: data.description || '',
      imageUrl: data.imageUrl || '', // Thêm imageUrl
      prizes,
      spinsPerUser: Number(data.spinsPerUser) || 1,
      status: data.status || 'draft', // Phù hợp với enum mới
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined
    });

    await campaign.save();
    req.flash('success_msg', 'Campaign created successfully');
    res.redirect('/admin/campaigns');
  } catch (error) {
    console.error('Create campaign error:', error);
    req.flash('error_msg', 'Error creating campaign: ' + error.message);
    res.render('admin/campaigns/create', { // Render lại form với dữ liệu đã nhập khi có lỗi
        title: 'Create Campaign',
        layout: 'layouts/admin',
        campaign: req.body, // gửi lại data cũ
        error_msg: 'Error creating campaign: ' + error.message
    });
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
  const { id } = req.params;
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
          image: prizeData.image || ''
        };
        // Giữ lại _id cho giải thưởng đã có để Mongoose biết cập nhật
        // Chỉ thêm _id nếu nó tồn tại và không phải là chuỗi rỗng (cho giải thưởng mới thêm vào form edit)
        if (prizeData.id && prizeData.id.trim() !== '') {
          newPrize._id = prizeData.id;
        }
        return newPrize;
      }).filter(prize => prize.name); // Lọc bỏ giải thưởng không có tên
    } else if (data.prizes && typeof data.prizes === 'object' && data.prizes.name) {
        // Trường hợp chỉ có 1 giải thưởng và form không gửi dưới dạng mảng
        const prizeData = data.prizes;
        const singlePrize = {
            name: prizeData.name,
            color: prizeData.color || '#FF6384',
            probability: Number(prizeData.probability) || 0,
            quantity: Number(prizeData.quantity) || 0,
            remaining: (typeof prizeData.remaining !== 'undefined') ? Number(prizeData.remaining) : Number(prizeData.quantity),
            image: prizeData.image || ''
        };
        if (prizeData.id && prizeData.id.trim() !== '') {
            singlePrize._id = prizeData.id;
        }
        prizes = [singlePrize];
    }


    if (prizes.length === 0) {
        req.flash('error_msg', 'Campaign must have at least one prize.');
        // Cần lấy lại campaign cũ để render form edit cho đúng
        const campaign = await Campaign.findById(id);
        return res.render('admin/campaigns/edit', {
            title: 'Edit Campaign',
            layout: 'layouts/admin',
            campaign: campaign, // Dữ liệu campaign cũ
            formData: data, // Dữ liệu người dùng vừa nhập bị lỗi (để điền lại form)
            error_msg: 'Campaign must have at least one prize.'
        });
    }
    
    const updateData = {
      title: data.name, // Lấy từ form input name="name"
      description: data.description || '',
      imageUrl: data.imageUrl || '', // Thêm imageUrl
      prizes,
      spinsPerUser: Number(data.spinsPerUser) || 1,
      status: data.status || 'draft',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined
    };

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedCampaign) {
        req.flash('error_msg', 'Campaign not found or failed to update.');
        return res.redirect('/admin/campaigns');
    }

    req.flash('success_msg', 'Campaign updated successfully');
    res.redirect('/admin/campaigns');
  } catch (error) {
    console.error('Update campaign error:', error);
    req.flash('error_msg', 'Error updating campaign: ' + error.message);
    // Cần lấy lại campaign cũ để render form edit cho đúng
    const campaign = await Campaign.findById(id); // Lấy lại campaign data gốc
    res.render('admin/campaigns/edit', { // Render lại form với dữ liệu gốc và thông báo lỗi
        title: 'Edit Campaign',
        layout: 'layouts/admin',
        campaign: campaign, // Dữ liệu campaign gốc
        formData: req.body, // Dữ liệu người dùng vừa nhập bị lỗi (để điền lại form nếu cần)
        error_msg: 'Error updating campaign: ' + error.message
    });
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
