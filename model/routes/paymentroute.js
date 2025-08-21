const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');


router.get('/mybids/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    
    const payments = await Payment.find({ highestBidderId: userId })
      .populate('auctionId', 'carName image')  
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
