// models/Supplier.js
const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true, unique: true },
  company: { type: String },
  address: { type: String },
  products: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);

// routes/suppliers.js
const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// GET /api/suppliers?search=&page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { name: new RegExp(search, 'i') },
        { contact: new RegExp(search, 'i') },
        { products: new RegExp(search, 'i') },
      ]
    };
    const total = await Supplier.countDocuments(query);
    const data = await Supplier.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ data, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const existing = await Supplier.findOne({ contact: req.body.contact });
    if (existing) return res.status(400).json({ error: 'Supplier already exists with this contact' });
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add supplier' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update supplier' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete supplier' });
  }
});

// GET /api/suppliers/:id (for profile viewing)
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch supplier' });
  }
});

module.exports = router;
