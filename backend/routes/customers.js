// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer by mobile number
router.get('/by-mobile/:mobile', async (req, res) => {
  try {
    const customer = await Customer.findOne({ mobile: req.params.mobile });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update customer logic
router.post('/', async (req, res) => {
  const { name, mobile, vehicleMake, vehicleModel, vehicleRegNo } = req.body;

  try {
    let customer = await Customer.findOne({ mobile });

    if (customer) {
      // Check if this car already exists
      const carExists = customer.vehicles.some(
        v => v.make === vehicleMake && v.model === vehicleModel && v.regNo === vehicleRegNo
      );

      if (carExists) {
        return res.status(400).json({ error: 'Car already exists for this customer.' });
      }

      customer.vehicles.push({ make: vehicleMake, model: vehicleModel, regNo: vehicleRegNo });
      await customer.save();
      return res.json({ message: 'Car added to existing customer.' });
    }

    // If no customer, create new
    customer = new Customer({
      name,
      mobile,
      vehicles: [{ make: vehicleMake, model: vehicleModel, regNo: vehicleRegNo }]
    });

    await customer.save();
    res.status(201).json({ message: 'Customer added successfully.' });
  } catch (err) {
    console.error('Error saving customer:', err);
    res.status(500).json({ error: 'Failed to add customer.' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, mobile },
      { new: true, runValidators: true }
    );

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await Customer.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
