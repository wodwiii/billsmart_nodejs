const express = require('express');
const User = require('../models/user');
const WaterBill = require('../models/waterBill');

const router = express.Router();

router.post('/water', async (req, res) => {
  try {
    const { accountNumber, waterReading } = req.body;

    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 15);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 14);

    let waterBill = await WaterBill.findOne({
      owner: user._id,
      periodStart,
      periodEnd,
    });

    if (!waterBill) {
      waterBill = new WaterBill({
        owner: user._id,
        periodStart,
        periodEnd,
      });
    }

    waterBill.readings.push({
      value: waterReading,
      timestamp: new Date(),
    });

    await waterBill.save();

    user.waterBills.push(waterBill._id);
    await user.save();

    res.status(201).json({ message: 'Water reading saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;