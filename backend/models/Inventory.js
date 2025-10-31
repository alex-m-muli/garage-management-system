// backend/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[a-zA-Z]+$/.test(v),
      message: props => `${props.value} is not a valid unit (only letters allowed)`
    }
  },
  price: { type: Number, required: true, min: 0.01 },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
