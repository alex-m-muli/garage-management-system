// backend/routes/laborRoutes.js
const express = require('express');
const router = express.Router();
const LaborEntry = require('../models/LaborEntry');
const { Parser } = require('json2csv');

// GET all entries
router.get('/', async (req, res) => {
  try {
    const entries = await LaborEntry.find();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new entry
router.post('/', async (req, res) => {
  const { technician, vehicleMake, vehicleModel, vehicleReg, workType, workDetails, hours } = req.body;
  if (!technician || !vehicleMake || !vehicleModel || !vehicleReg || !workType || hours === undefined) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  try {
    const newEntry = new LaborEntry({ technician, vehicleMake, vehicleModel, vehicleReg, workType, workDetails, hours });
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update entry
router.put('/:id', async (req, res) => {
  try {
    const updated = await LaborEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    await LaborEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET labor report CSV
router.get('/report/labor', async (req, res) => {
  const { month, year } = req.query;
  let filter = {};

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  try {
    const entries = await LaborEntry.find(filter);
    if (!entries.length) {
      return res.status(404).json({ message: 'No labor entries found for selected date.' });
    }

    const data = entries.map(entry => ({
      technician: entry.technician,
      vehicle: `${entry.vehicleMake} ${entry.vehicleModel} (${entry.vehicleReg})`,
      workType: entry.workType,
      workDetails: entry.workDetails || '',
      hours: entry.hours,
      date: entry.date.toISOString().split('T')[0]
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('labor-report.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report.' });
  }
});

// GET summary labor report (for dashboard)
router.get('/report/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const entries = await LaborEntry.find(filter);
    if (!entries.length) return res.status(404).json({ message: 'No labor entries found for selected date.' });

    const technicianStats = {};

    entries.forEach(entry => {
      const { technician, vehicleReg, hours } = entry;
      if (!technicianStats[technician]) {
        technicianStats[technician] = {
          technician,
          cars: new Set(),
          totalHours: 0
        };
      }
      technicianStats[technician].cars.add(vehicleReg);
      technicianStats[technician].totalHours += Number(hours);
    });

    const result = Object.values(technicianStats).map(stat => ({
      technician: stat.technician,
      carsWorkedOn: stat.cars.size,
      totalHours: stat.totalHours
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate summary.' });
  }
});

module.exports = router;
