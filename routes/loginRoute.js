const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/login', async (req, res) => {
  const { accountNumber, password } = req.body;

  try {
    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid account number' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    res.json({ message: 'Login successful', details:{ 'Name': user.name, 'AccountNumber': user.accountNumber} }); // Replace 'dummy_token' with a JWT token

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
