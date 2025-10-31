const mongoose = require('mongoose');

// Sub-schema for individual vehicle objects
const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  regNo: {
    type: String,
    required: true,
    match: /^[A-Z]{3} \d{3}[A-Z]$/, // Validates format like "KAA 123A"
  },
}, { _id: false });

// Main Customer schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    match: /^07\d{8}$/, // Validates Kenyan mobile format
    // Removed unique constraint to allow duplicates
  },
  vehicles: {
    type: [vehicleSchema],
    required: true,
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'At least one vehicle is required.'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
