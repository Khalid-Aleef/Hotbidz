const express = require('express');
const router = express.Router();
const ComingSoon = require('../models/coming_soon');
const AuctionStore = require('../models/auction_store');

// List all coming soon auctions (optionally exclude user's own)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = {};
    if (userId) query.sellerId = { $ne: userId };

    const items = await ComingSoon.find(query).sort({ start: 1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Promote scheduled auction to live if start time reached (idempotent)
router.post('/promote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cs = await ComingSoon.findById(id);
    if (!cs) return res.status(404).json({ message: 'Item not found' });

    const now = new Date();
    if (cs.start > now) {
      return res.status(400).json({ message: 'Start time not reached yet' });
    }

    // Create in auction store
    const live = await AuctionStore.create({
      carId: cs.carId,
      sellerId: cs.sellerId,
      carName: cs.carName,
      year: cs.year,
      series: cs.series,
      rarity: cs.rarity,
      image: cs.image,
      description: cs.description,
      startingBid: cs.startingBid,
      currentBid: cs.currentBid,
      end: cs.end,
      status: 'open',
      cmnt: []
    });

    await ComingSoon.findByIdAndDelete(id);
    return res.json({ message: 'Promoted to live auction', auction: live });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;


