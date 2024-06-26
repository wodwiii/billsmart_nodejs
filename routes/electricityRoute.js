const express = require('express');
const User = require('../models/user');
const ElectricityBill = require('../models/electricityBill');

const router = express.Router();

router.post('/electricity', async (req, res) => {
  try {
    const { accountNumber, electricityReading } = req.body;

    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    const periodStart = today.getDate() > 14
      ? new Date(today.getFullYear(), today.getMonth(), 15)
      : new Date(today.getFullYear(), today.getMonth()-1, 15);
    const periodEnd = today.getDate() > 14
      ? new Date(today.getFullYear(), today.getMonth()+1, 14)
      : new Date(today.getFullYear(), today.getMonth(), 14);

    let electricityBill = await ElectricityBill.findOne({
      owner: user.accountNumber,
      periodStart,
      periodEnd,
    });

    if (!electricityBill) {
      electricityBill = new ElectricityBill({
        owner: user.accountNumber,
        periodStart,
        periodEnd,
      });
      user.electricityBills.push(electricityBill._id);
      await user.save();
    }

    electricityBill.readings.push({
      value: electricityReading,
      timestamp: new Date(),
    });

    await electricityBill.save();

    res.status(201).json({ message: 'Electricity reading saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
