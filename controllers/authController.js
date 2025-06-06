const  bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if admin
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        req.session.user = {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        };
        
        return res.redirect('/admin/dashboard');
      }
    }
    
    // If not admin or password doesn't match, show error
    req.flash('error_msg', 'Invalid email or password');
    return res.redirect('/user/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/user/login');
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/user/register');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await newAdmin.save();
    
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/user/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/user/register');
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Phone number already registered' 
      });
    }
    
    const newUser = new User({
      name,
      phone,
      role: 'user'
    });
    
    await newUser.save();
    
    return res.json({ 
      success: true, 
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error(err);
    return res.json({ 
      success: false, 
      message: 'Server error'
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
 