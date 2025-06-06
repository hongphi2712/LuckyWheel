require('dotenv').config();
const  express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/campaigns', require('./routes/campaigns'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// Error handling - 404
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    layout: 'layouts/main'
  });
});

// Error handling - 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    layout: 'layouts/main',
    error: err
  });
});

// Start server
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
