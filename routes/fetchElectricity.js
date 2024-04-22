const express = require('express');
const router = express.Router();
const ElectricityBill = require('../models/electricityBill');

// Aggregate Electricity Bills
router.get('/electricity/aggregated', async (req, res) => {
  try {
    const { type } = req.query;
    let start, end;

    switch (type) {
      case 'day':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const today = new Date();
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        break;
      case 'month':
        start = new Date();
        start.setDate(15);
        end = new Date();
        break;
      default:
        return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const result = await ElectricityBill.aggregate([
      {
        $match: {
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
        $group: {
          _id: null,
          totalElectricityBill: { $sum: '$readings.value' }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.json({ totalElectricityBill: result[0].totalElectricityBill });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;