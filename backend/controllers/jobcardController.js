// backend/controllers/jobcardController.js
const JobCard = require('../models/JobCard');
const Customer = require('../models/Customer');

// Utility: Sync customer data from a new job card
const syncCustomerFromJobCard = async (jobCard) => {
  try {
    const { name, phone, make, model, regNo, repairs, date } = jobCard;

    if (!name || !phone) return;

    const existing = await Customer.findOne({ name, phone });
    const newVehicle = { make, model, regNo };
    const newHistory = {
      date: date || new Date(),
      description: repairs || 'Service Entry',
    };

    if (existing) {
      const hasVehicle = existing.vehicles.some(
        v => v.regNo === regNo
      );
      if (!hasVehicle) existing.vehicles.push(newVehicle);

      existing.serviceHistory.push(newHistory);
      await existing.save();
    } else {
      const newCustomer = new Customer({
        name,
        phone,
        vehicles: [newVehicle],
        serviceHistory: [newHistory],
      });
      await newCustomer.save();
    }
  } catch (error) {
    console.error('Customer sync error:', error);
  }
};

// Controller: Save new job card and auto-sync customer
exports.createJobCard = async (req, res) => {
  try {
    const newCard = new JobCard(req.body);
    const savedCard = await newCard.save();

    // Sync to customer collection
    await syncCustomerFromJobCard(savedCard);

    res.status(201).json(savedCard);
  } catch (err) {
    console.error('JobCard creation failed:', err);
    res.status(400).json({ message: err.message });
  }
};

// Export sync function if needed elsewhere (optional)
exports.syncCustomerFromJobCard = syncCustomerFromJobCard;
