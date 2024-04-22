const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  accountNumber: String,
  waterBills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WaterBill' }],
  electricityBills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ElectricityBill' }],
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
