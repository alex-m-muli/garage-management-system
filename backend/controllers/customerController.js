const JobCard = require('../models/JobCard');

const getAllCustomers = async (req, res) => {
  try {
    const jobcards = await JobCard.find({});
    const customerMap = {};

    jobcards.forEach(card => {
      if (!customerMap[card.mobile]) {
        customerMap[card.mobile] = {
          name: card.name,
          mobile: card.mobile,
          vehicles: []
        };
      }
      customerMap[card.mobile].vehicles.push({
        regNo: card.regNo,
        make: card.make,
        model: card.model,
        repairs: card.repairs,
        totalCost: card.totalCost,
        date: card.date
      });
    });

    const customers = Object.values(customerMap);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers', error: err.message });
  }
};

const getCustomerHistory = async (req, res) => {
  try {
    const mobile = req.params.mobile;
    const history = await JobCard.find({ mobile });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
};

module.exports = { getAllCustomers, getCustomerHistory };
