const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all staff (excluding admin)
router.get('/', userController.getUsers);

// POST create new staff
router.post('/', userController.createUser);

// PUT update staff
router.put('/:id', userController.updateUser);

// DELETE staff
router.delete('/:id', userController.deleteUser);

module.exports = router;
