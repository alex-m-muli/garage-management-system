const mongoose = require('mongoose');

const jobCardSchema = new mongoose.Schema({
  name: String,
  poBox: String,
  tel: String,
  date: String,
  town: String,
  mobile: String,
  make: String,
  model: String,
  regNo: String,
  speedo: String,
  repairs: String,
  signature: String,
  jobNo: String,
  totalCost: Number
});

module.exports = mongoose.model('JobCard', jobCardSchema);
