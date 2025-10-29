const mongoose = require('mongoose');
const User = require('./models/User');
const AllowedAdmin = require('./models/AllowedAdmin');
require('dotenv').config();

const admins = [
  {
    name: 'Super Admin',
    email: 'admin1@medicare.com',
    username: 'admin1',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Operations Admin',
    email: 'admin2@medicare.com',
    username: 'admin2',
    password: 'admin123',
    role: 'admin'
  }
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('Connected to MongoDB');

    // Create or update admin users and allowed admin list
    for (const a of admins) {
      // Upsert allowed admin record
      await AllowedAdmin.updateOne({ email: a.email.toLowerCase() }, { $set: { name: a.name } }, { upsert: true });

      // Upsert user record
      const existing = await User.findOne({ email: a.email.toLowerCase() });
      if (existing) {
        existing.username = a.username;
        existing.role = 'admin';
        existing.password = a.password; // will be hashed by pre-save
        await existing.save();
        console.log(`Updated admin user: ${a.email}`);
      } else {
        await User.create({
          username: a.username,
          email: a.email.toLowerCase(),
          password: a.password,
          role: 'admin'
        });
        console.log(`Created admin user: ${a.email}`);
      }
    }

    console.log('Admin seed finished');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admins:', err);
    process.exit(1);
  }
};

seedAdmins();
