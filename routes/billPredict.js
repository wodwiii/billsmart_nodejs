const express = require('express');
const WaterBill = require('../models/waterBill'); // Import WaterBill model
const ElectricityBill = require('../models/electricityBill');
const router = express.Router();
const {waterRate, electricityRate} = require('../rates');

router.get('/water/predict', async (req, res) => {
  try {
    const { accountNumber } = req.query;
    const today = new Date();
    const startDate = today.getDate() > 14
      ? new Date(today.getFullYear(), today.getMonth(), 15)
      : new Date(today.getFullYear(), today.getMonth()-1, 15);
      const endDate = today.getDate() > 14
      ? new Date(today.getFullYear(), today.getMonth()+1, 14)
      : new Date(today.getFullYear(), today.getMonth(), 14);
    const billingCycleDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const waterBills = await WaterBill.find({
        owner: accountNumber,
        'readings.timestamp': {
          $gte: startDate,
          $lte: today,
        },
      });
      const uniqueDays = new Set();
      waterBills.forEach(bill => {
        bill.readings.forEach(reading => {
          const day = new Date(reading.timestamp).toISOString().split('T')[0];
          uniqueDays.add(day);
        });
      });
      const numberOfUniqueDays = uniqueDays.size;
      const totalConsumption = waterBills[0].total;
      const dailyAverageConsumption = totalConsumption / numberOfUniqueDays;
      const predictedBill = dailyAverageConsumption * billingCycleDays;
      const predictPhp = predictedBill * waterRate;
      res.json({ predictedBill: predictedBill.toFixed(2), predictPhp : predictPhp.toFixed(2), totalDays: billingCycleDays, numberOfUniqueDays });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/electricity/predict', async (req, res) => {
    try {
      const { accountNumber } = req.query;
      const today = new Date();
      const startDate = today.getDate() > 14
        ? new Date(today.getFullYear(), today.getMonth(), 15)
        : new Date(today.getFullYear(), today.getMonth() - 1, 15);
      const endDate = today.getDate() > 14
        ? new Date(today.getFullYear(), today.getMonth() + 1, 14)
        : new Date(today.getFullYear(), today.getMonth(), 14);
      const billingCycleDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const electricityBills = await ElectricityBill.find({
        owner: accountNumber,
        'readings.timestamp': {
          $gte: startDate,
          $lte: today,
        },
      });
      const uniqueDays = new Set();
      electricityBills.forEach(bill => {
        bill.readings.forEach(reading => {
          const day = new Date(reading.timestamp).toISOString().split('T')[0];
          uniqueDays.add(day);
        });
      });
      const numberOfUniqueDays = uniqueDays.size;
      const totalConsumption = electricityBills[0].total;
      const dailyAverageConsumption = totalConsumption / numberOfUniqueDays;
      const predictedBill = dailyAverageConsumption * billingCycleDays;
      const predictPhp = predictedBill * electricityRate;
      res.json({ predictedBill: predictedBill.toFixed(2), predictPhp : predictPhp.toFixed(2), totalDays: billingCycleDays, numberOfUniqueDays });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;
