

const express = require('express');
const router = express.Router();
const Car = require('../models/car');


router.get('/', async (req, res) => {
  try {
    const auctionCars = await Car.find({ auc: 1 });
    res.json(auctionCars);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
