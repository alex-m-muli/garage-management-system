// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^(\+254|0)7\d{8}$/.test(v),
      message: props => `${props.value} is not a valid phone number (must be in format +2547XXXXXXXX or 07XXXXXXXX)`
    }
  },
  company: { type: String },
  address: { type: String },
  products: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);