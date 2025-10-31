const LaborEntry = require('../models/LaborEntry');

// Create a new labor entry
exports.createEntry = async (req, res) => {
  try {
    const {
      technician, vehicleMake, vehicleModel, vehicleReg,
      partFixed, repairDetails, hours
    } = req.body;

    // Validate inputs
    if (!technician || !vehicleMake || !vehicleModel || !vehicleReg || !partFixed || !repairDetails || hours == null) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (isNaN(hours)) {
      return res.status(400).json({ error: 'Hours must be a number.' });
    }

    const newEntry = new LaborEntry({
      technician, vehicleMake, vehicleModel, vehicleReg,
      partFixed, repairDetails, hours
    });

    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating entry.' });
  }
};

// Get all entries
exports.getEntries = async (req, res) => {
  try {
    const entries = await LaborEntry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await LaborEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};
