// backend/routes/jobcards.js
const express = require('express');
const router = express.Router();
const JobCard = require('../models/JobCard');
const syncCustomerFromJobCard = require('../utils/syncCustomerFromJobCard'); // Fix spelling case

// GET all job cards with pagination & search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const currentPage = Number(page);
    const perPage = Number(limit);

    const query = search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { mobile: new RegExp(search, 'i') },
            { regNo: new RegExp(search, 'i') },
            { make: new RegExp(search, 'i') },
            { model: new RegExp(search, 'i') },
            { poBox: new RegExp(search, 'i') },
            { tel: new RegExp(search, 'i') },
            { town: new RegExp(search, 'i') },
            { repairs: new RegExp(search, 'i') },
          ],
        }
      : {};

    const total = await JobCard.countDocuments(query);
    const totalPages = Math.ceil(total / perPage);

    const cards = await JobCard.find(query)
      .sort({ date: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.json({ total, totalPages, currentPage, cards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single job card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await JobCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create new job card and sync to customers
router.post('/', async (req, res) => {
  try {
    const newCard = new JobCard(req.body);
    const saved = await newCard.save();

    // Auto-sync customer data from jobcard
    await syncCustomerFromJobCard(saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update existing job card
router.put('/:id', async (req, res) => {
  try {
    const updated = await JobCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE job card by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await JobCard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// backend/routes/jobcards.js
router.get('/customer/:mobile', async (req, res) => {
  try {
    const jobcards = await JobCard.find({ mobile: req.params.mobile }).sort({ date: -1 });
    res.json(jobcards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobcards' });
  }
});

module.exports = router;
