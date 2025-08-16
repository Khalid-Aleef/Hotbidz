const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');

// Route to get payments for a specific user (where the user is the highest bidder)
router.get('/mybids/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find payments where the user is the highest bidder
    const payments = await Payment.find({ highestBidderId: userId })
      .populate('auctionId', 'carName image')  // Populate the auction info like car name and image
      .exec();

    if (payments.length === 0) {
      return res.status(404).json({ message: 'No bids found for this user.' });
    }

    res.json(payments);
  } catch (err) {
    console.error('Error fetching user bids:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
