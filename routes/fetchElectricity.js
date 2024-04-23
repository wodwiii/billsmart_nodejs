const express = require('express');
const router = express.Router();
const ElectricityBill = require('../models/electricityBill');
const {electricityRate} = require('../rates');


router.get('/electricity/aggregated', async (req, res) => {
  try {
    const { type, accountNumber } = req.query;
    let start, end, matchCriteria = {};
    const today = new Date();

    switch (type) {
      case 'day':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        break;
      case 'month':
        start = today.getDate() > 14
        ? new Date(today.getFullYear(), today.getMonth(), 15)
        : new Date(today.getFullYear(), today.getMonth() - 1, 15);
        end = today.getDate() > 14
          ? new Date(today.getFullYear(), today.getMonth() + 1, 14)
          : new Date(today.getFullYear(), today.getMonth(), 14);
        break;
      default:
        return res.status(400).json({ message: 'Invalid type parameter' });
    }
    if (accountNumber) {
      matchCriteria['owner'] = accountNumber;
    }

    const result = await ElectricityBill.aggregate([
      {
        $match: {
          ...matchCriteria,
          'readings.timestamp': {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $unwind: '$readings'
      },
      {
        $match: {
          'readings.timestamp': {
            $gte: start,
            $lte: end
          }
        }
      },
      {
        $group: {
          _id: '$owner',
          totalElectricityBill: { $sum: '$readings.value' }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    const totalElectricityBill = result[0].totalElectricityBill;
    const totalPhp = result[0].totalElectricityBill * electricityRate;

    res.json({ totalElectricityBill:  totalElectricityBill.toFixed(2), totalPhp: totalPhp.toFixed(2)});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
