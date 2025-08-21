const express = require('express');
const router = express.Router();
const AuctionStore = require('../models/auction_store'); 


router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; 

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    
    const myAuctions = await AuctionStore.find({ sellerId: userId })
      .sort({ end: -1 }) 
      .populate('carId', 'carName image'); 

    return res.json(myAuctions);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
