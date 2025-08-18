const express = require('express');
const router = express.Router();
const AuctionStore = require('../models/auction_store'); // Adjust path if needed

// GET /api/myauctions?userId=123
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; // Only need userId

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch all auctions where the user is the seller
    const myAuctions = await AuctionStore.find({ sellerId: userId })
      .sort({ end: -1 }) // Sort by end time descending
      .populate('carId', 'carName image'); // Include car details

    return res.json(myAuctions);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
