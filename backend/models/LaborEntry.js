// backend/models/LaborEntry.js
const mongoose = require('mongoose');

const laborSchema = new mongoose.Schema({
  technician: { type: String, required: true },
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleReg: { type: String, required: true },
  workType: { type: String, required: true },
  workDetails: { type: String }, // optional
  hours: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LaborEntry', laborSchema);
