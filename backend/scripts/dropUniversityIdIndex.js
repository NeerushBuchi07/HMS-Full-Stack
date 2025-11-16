require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://HMS_user:HMS%40123@hms.3m0ey2n.mongodb.net/HMS?retryWrites=true&w=majority&appName=HMS";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop the universityId index
    try {
      await collection.dropIndex('universityId_1');
      console.log('✅ Dropped universityId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ Index universityId_1 does not exist (already dropped or never existed)');
      } else {
        throw err;
      }
    }

    console.log('✅ Database cleanup complete');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
