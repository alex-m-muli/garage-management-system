// seed/adminSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('Root@25', 10);

    const adminUser = new User({
      username: 'Narayan',
      password: hashedPassword,
      role: 'Admin',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Failed to create admin user:', err);
    process.exit(1);
  }
})();
