const express = require('express');
const router = express.Router();
const WaterBill = require('../models/waterBill');

router.get('/water/aggregated', async (req, res) => {
  try {
    const { type, accountNumber } = req.query;
    let start, end, matchCriteria = {};

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

    if (accountNumber) {
      matchCriteria['owner'] = accountNumber; // Filter by account number
    }

    const result = await WaterBill.aggregate([
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
        $group: {
          _id: '$owner',
          totalWaterBill: { $sum: '$readings.value' }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.json({ totalWaterBill: result[0].totalWaterBill });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
