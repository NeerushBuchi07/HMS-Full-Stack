require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const AllowedAdmin = require('../models/AllowedAdmin');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Please add it to your environment or .env file.');
  process.exit(1);
}

const parseArgs = () => {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = process.argv[i + 1];
      if (!value || value.startsWith('--')) {
        console.error(`❌ Missing value for argument --${key}`);
        process.exit(1);
      }
      args[key] = value;
      i++;
    }
  }
  return args;
};

const run = async () => {
  const argv = parseArgs();
  const email = (argv.email || '').toLowerCase();
  const password = argv.password;
  const username = argv.username || email.split('@')[0];
  const name = argv.name || username;

  if (!email || !password) {
    console.error('❌ Usage: node scripts/bootstrapAdmin.js --email admin@example.com --password secret [--username admin] [--name "Admin Name"]');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      user = new User({ username, email, password, role: 'admin' });
      await user.save();
      console.log('✅ Created admin user');
    } else {
      user.username = username;
      user.role = 'admin';
      user.password = password;
      await user.save();
      console.log('✅ Updated existing admin user password/role');
    }

    await AllowedAdmin.updateOne(
      { email },
      { $set: { email, name } },
      { upsert: true }
    );
    console.log('✅ Ensured AllowedAdmin entry exists');

    console.log('\nAdmin bootstrap complete. You can now log in with:');
    console.log(`Email: ${email}`);
    console.log('Password: (the one you provided)');
  } catch (error) {
    console.error('❌ Failed to bootstrap admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
