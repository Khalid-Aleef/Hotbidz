const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const AuctionStore = require('../models/auction_store');  


router.get('/:userId', async (req, res) => {
  try {
    const { search, rarity } = req.query; 

    
    const filter = { addedBy: req.params.userId };

    
    if (search) {
      filter.name = { $regex: search, $options: 'i' }; 
    }

    
    if (rarity) {
      filter.rarity = rarity;
    }

    
    const cars = await Car.find(filter);

    
    const carsWithAuctionStatus = await Promise.all(cars.map(async (car) => {
      const auction = await AuctionStore.findOne({ carId: car._id });
      car.inAuction = auction ? true : false;  
      return car;
    }));

    res.json(carsWithAuctionStatus); 
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
