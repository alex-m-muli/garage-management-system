const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get all non-admin users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new staff
exports.createUser = async (req, res) => {
  const { username, position, contact, salary } = req.body;

  if (!username || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (salary !== undefined && (!Number.isFinite(salary) || salary < 0)) {
    return res.status(400).json({ error: 'Salary must be a non-negative number' });
  }

  try {
    const user = new User({
      username,
      position,
      contact,
      salary,
      role: 'staff'
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update existing staff
exports.updateUser = async (req, res) => {
  const { username, position, contact, salary } = req.body;

  if (salary !== undefined && (!Number.isFinite(salary) || salary < 0)) {
    return res.status(400).json({ error: 'Salary must be a non-negative number' });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, position, contact, salary },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete staff
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.username.toLowerCase() === 'narayan') {
      return res.status(403).json({ error: 'Cannot delete protected user "narayan"' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
