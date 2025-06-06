require('dotenv').config();
const  mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Campaign = require('../models/Campaign');
const SpinResult = require('../models/SpinResult');
const connectDB = require('../config/database');

// Connect to database
connectDB();

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Campaign.deleteMany({});
    await SpinResult.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Create admin user
    const adminUser = new Admin({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created');
    
    // Create regular users
    const users = [
      {
        name: 'John Doe',
        phone: '1234567890',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        phone: '0987654321',
        role: 'user'
      },
      {
        name: 'Test User',
        phone: '5555555555',
        role: 'user'
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log('Regular users created');
    
    // Create campaigns
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // End date is one month from now
    
    const campaigns = [
      {
        name: 'Summer Lucky Draw',
        description: 'Spin the wheel and win exciting summer prizes!',
        startDate,
        endDate,
        status: 'active',
        spinsPerUser: 3,
        createdBy: adminUser._id,
        prizes: [
          {
            name: 'Grand Prize',
            probability: 5,
            quantity: 1,
            remaining: 1,
            color: '#FF6384'
          },
          {
            name: '$50 Gift Card',
            probability: 10,
            quantity: 5,
            remaining: 5,
            color: '#36A2EB'
          },
          {
            name: 'T-Shirt',
            probability: 20,
            quantity: 10,
            remaining: 10,
            color: '#FFCE56'
          },
          {
            name: '10% Discount',
            probability: 25,
            quantity: 50,
            remaining: 50,
            color: '#4BC0C0'
          },
          {
            name: 'Try Again',
            probability: 40,
            quantity: 100,
            remaining: 100,
            color: '#9966FF'
          }
        ]
      },
      {
        name: 'Holiday Giveaway',
        description: 'Celebrate the holidays with amazing prizes!',
        startDate,
        endDate,
        status: 'active',
        spinsPerUser: 1,
        createdBy: adminUser._id,
        prizes: [
          {
            name: 'Premium Package',
            probability: 3,
            quantity: 1,
            remaining: 1,
            color: '#FF6384'
          },
          {
            name: '$20 Gift Card',
            probability: 7,
            quantity: 10,
            remaining: 10,
            color: '#36A2EB'
          },
          {
            name: 'Free Coffee',
            probability: 20,
            quantity: 30,
            remaining: 30,
            color: '#FFCE56'
          },
          {
            name: 'Free Shipping',
            probability: 30,
            quantity: 50,
            remaining: 50,
            color: '#4BC0C0'
          },
          {
            name: 'No Luck',
            probability: 40,
            quantity: 100,
            remaining: 100,
            color: '#9966FF'
          }
        ]
      }
    ];
    
    const createdCampaigns = await Campaign.insertMany(campaigns);
    console.log('Campaigns created');
    
    // Create some spin results
    const spinResults = [
      {
        user: createdUsers[0]._id,
        campaign: createdCampaigns[0]._id,
        prize: {
          id: createdCampaigns[0].prizes[2]._id,
          name: createdCampaigns[0].prizes[2].name,
          image: ''
        },
        phone: createdUsers[0].phone
      },
      {
        user: createdUsers[1]._id,
        campaign: createdCampaigns[0]._id,
        prize: {
          id: createdCampaigns[0].prizes[3]._id,
          name: createdCampaigns[0].prizes[3].name,
          image: ''
        },
        phone: createdUsers[1].phone
      },
      {
        user: createdUsers[0]._id,
        campaign: createdCampaigns[1]._id,
        prize: {
          id: createdCampaigns[1].prizes[1]._id,
          name: createdCampaigns[1].prizes[1].name,
          image: ''
        },
        phone: createdUsers[0].phone
      }
    ];
    
    await SpinResult.insertMany(spinResults);
    console.log('Spin results created');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
 