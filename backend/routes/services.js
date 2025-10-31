const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET all services
router.get('/', serviceController.getAllServices);

// POST add a new service
router.post('/', serviceController.addService);

// PUT update service
router.put('/:id', serviceController.updateService);

// DELETE service
router.delete('/:id', serviceController.deleteService);

module.exports = router;
