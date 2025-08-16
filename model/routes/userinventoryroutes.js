const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const AuctionStore = require('../models/auction_store');  // Assuming AuctionStore exists

// GET /api/inventory/:userId
router.get('/:userId', async (req, res) => {
  try {
    const cars = await Car.find({ addedBy: req.params.userId });

    // Check if each car is in an active auction
    const carsWithAuctionStatus = await Promise.all(cars.map(async (car) => {
      // Find an active auction for the car
      const auction = await AuctionStore.findOne({ carId: car._id });
      car.inAuction = auction ? true : false;  // Set inAuction flag
      return car;
    }));

    res.json(carsWithAuctionStatus);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
