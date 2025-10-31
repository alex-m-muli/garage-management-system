// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const LaborEntry = require('../models/LaborEntry');
const Inventory = require('../models/Inventory'); // Assuming this model exists
const { Parser } = require('json2csv');

// Utility to send CSV response
const sendCSV = (res, data, fields, filename) => {
  try {
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate CSV.' });
  }
};

// Labor report by technician for the month
router.get('/labor', async (req, res) => {
  try {
    const month = parseInt(req.query.month); // 0-11
    const year = parseInt(req.query.year);
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const entries = await LaborEntry.find({
      date: { $gte: start, $lte: end },
    });

    const grouped = {};

    for (const entry of entries) {
      if (!grouped[entry.technician]) grouped[entry.technician] = { technician: entry.technician, carsWorked: new Set(), totalHours: 0 };
      grouped[entry.technician].carsWorked.add(entry.vehicleReg);
      grouped[entry.technician].totalHours += entry.hours;
    }

    const csvData = Object.values(grouped).map(t => ({
      Technician: t.technician,
      "Cars Worked On": t.carsWorked.size,
      "Total Hours Worked": t.totalHours.toFixed(1),
    }));

    sendCSV(res, csvData, ["Technician", "Cars Worked On", "Total Hours Worked"], `labor_report_${month + 1}_${year}.csv`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inventory Report
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find();
    const csvData = inventory.map(item => ({
      Name: item.name,
      Category: item.category,
      Quantity: item.quantity,
      Cost: item.cost,
      Supplier: item.supplier,
      Status: item.status,
    }));

    sendCSV(res, csvData, ["Name", "Category", "Quantity", "Cost", "Supplier", "Status"], `inventory_report.csv`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
