// seed/adminSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

(async () => {
  // 1. Validate Environment Variables
  const { MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('❌ CRITICAL ERROR: Missing environment variables.');
    console.error('   Please ensure MONGO_URI, ADMIN_USERNAME, and ADMIN_PASSWORD are set in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // 2. Check if specific admin already exists
    const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      console.log(`⚠️  Admin user "${ADMIN_USERNAME}" already exists. No changes made.`);
      return process.exit();
    }

    // 3. Hash the password from .env
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 4. Create the user
    const adminUser = new User({
      username: ADMIN_USERNAME,
      password: hashedPassword,
      role: 'admin', // Logic dictates this should always be 'admin'
    });

    await adminUser.save();
    console.log(`✅ Admin user "${ADMIN_USERNAME}" created successfully!`);
    process.exit();
  } catch (err) {
    console.error('❌ Failed to create admin user:', err);
    process.exit(1);
  }
})();