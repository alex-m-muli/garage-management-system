const Service = require('../models/Services');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Add a new service
exports.addService = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newService = new Service({ title, description });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add service' });
  }
};

// Edit a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update service' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete service' });
  }
};
