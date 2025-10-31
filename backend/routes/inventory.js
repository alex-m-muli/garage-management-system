// backend/routes/inventory.js
const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');

// GET /api/inventory?search=&supplierId=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { search = '', supplierId = '', page = 1, limit = 10 } = req.query;
    const query = {
      name: { $regex: search, $options: 'i' },
    };
    if (supplierId) query.supplier = supplierId;

    const total = await Inventory.countDocuments(query);
    const data = await Inventory.find(query)
      .populate('supplier', 'name contact')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ data, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /inventory error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unit, price, supplier } = req.body;

    if (!name || !supplier || !unit || price <= 0 || quantity < 0) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    const existingSupplier = await Supplier.findById(supplier);
    if (!existingSupplier) return res.status(400).json({ error: 'Invalid supplier' });

    const existingItem = await Inventory.findOne({ name, supplier });
    if (existingItem) return res.status(400).json({ error: 'Item already exists for this supplier' });

    const item = new Inventory({ name, quantity, unit, price, supplier });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('POST /inventory error:', err);
    res.status(400).json({ error: 'Failed to add item' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error('PUT /inventory/:id error:', err);
    res.status(400).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE /inventory/:id error:', err);
    res.status(400).json({ error: 'Failed to delete item' });
  }
});

// GET /api/inventory/suppliers/list
router.get('/suppliers/list', async (req, res) => {
  try {
    const suppliers = await Supplier.find({}, 'name contact');
    res.json(suppliers);
  } catch (err) {
    console.error('GET /inventory/suppliers/list error:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/inventory/report/summary - generate inventory report data
router.get('/report/summary', async (req, res) => {
  try {
    const items = await Inventory.find();

    if (!items || !items.length) {
      return res.status(404).json({ message: 'No inventory data found.' });
    }

    const formatted = items.map(item => ({
      itemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price || 0,
      totalPrice: (item.quantity * (item.price || 0)).toFixed(2)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Inventory report generation failed:', error);
    res.status(500).json({ message: 'Internal server error while generating inventory report.' });
  }
});

module.exports = router;
