module.exports  = {
  // Ensure user is authenticated
  ensureAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/user/login');
  },
  
  // Ensure user is an admin
  ensureAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Access denied. Admin privileges required');
    res.redirect('/');
  },
  
  // Redirect if already authenticated
  forwardAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    if (req.session.user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/campaigns');
    }
  }
};
 