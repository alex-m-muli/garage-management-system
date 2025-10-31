const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'staff' },
  position: { type: String },
  contact: { type: String },
  salary: {
    type: Number,
    min: [0, 'Salary must be non-negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Salary must be a valid number'
    }
  }
});

// Password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
