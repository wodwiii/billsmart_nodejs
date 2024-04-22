const express = require('express');
const waterRoute = require('./waterRoute');
const electricityRoute = require('./electricityRoute');
const fetchElectricity = require('../routes/fetchElectricity');
const fetchWater = require('../routes/fetchWater');
const router = express.Router();

router.use('/api', waterRoute);
router.use('/api', electricityRoute);
router.use('/api', fetchElectricity);
router.use('/api', fetchWater);

module.exports = router;
