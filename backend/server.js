const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
//const createBackup = require('./utils/createBackup');
//const cleanupOldBackups = require('./utils/cleanupOldBackups');

// Daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Auto-backup triggered...');
  await createBackup(); // Ensure this returns a promise
  cleanupOldBackups();
});


// server.js
const authRoutes = require('./routes/auth');
const customers = require('./routes/customers');
const userRoutes = require('./routes/users');
const jobCardRoutes = require('./routes/jobcards');
const supplierRoutes = require('./routes/suppliers');
const inventoryRoutes =require('./routes/inventory');
const serviceRoutes = require('./routes/services');
const laborRoutes = require('./routes/laborRoutes');
const reportRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backupRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1); // Exit if connection fails
  });

// API Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customers);
app.use('/api/jobcards', jobCardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n🔌 Received ${signal}. Closing server and MongoDB connection...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('🛑 MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // kill command
