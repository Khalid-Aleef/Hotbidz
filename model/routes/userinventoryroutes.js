const express = require('express');
const router = express.Router();
const Car = require('../models/car');


router.get('/:userId', async (req, res) => {
  try {
    const cars = await Car.find({ addedBy: req.params.userId });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;