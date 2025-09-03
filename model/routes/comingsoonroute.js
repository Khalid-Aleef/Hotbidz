const express = require('express');
const router = express.Router();
const ComingSoon = require('../models/coming_soon');
const AuctionStore = require('../models/auction_store');


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


router.post('/promote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cs = await ComingSoon.findById(id);
    if (!cs) return res.status(404).json({ message: 'Item not found' });

    const now = new Date();
    if (cs.start > now) {
      return res.status(400).json({ message: 'Start time not reached yet' });
    }

    console.log(`Attempting to promote coming soon auction ${id} for car ${cs.carId}`);

    
    const existingAuction = await AuctionStore.findOne({
      carId: cs.carId
    });

    if (existingAuction) {
      console.log(`Car ${cs.carId} already exists in auction ${existingAuction._id} with status ${existingAuction.status}`);
      
      await ComingSoon.findByIdAndDelete(id);
      return res.status(400).json({ 
        message: 'Car is already in an auction',
        existingAuctionId: existingAuction._id,
        existingAuctionStatus: existingAuction.status
      });
    }

    console.log(`No existing auction found for car ${cs.carId}, creating new auction`);

    
    const doubleCheck = await AuctionStore.findOne({
      carId: cs.carId
    });

    if (doubleCheck) {
      console.log(`Race condition detected: Car ${cs.carId} was created in another request`);
      await ComingSoon.findByIdAndDelete(id);
      return res.status(400).json({ 
        message: 'Car is already in an auction (race condition detected)',
        existingAuctionId: doubleCheck._id,
        existingAuctionStatus: doubleCheck.status
      });
    }

    
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

    console.log(`Successfully created auction ${live._id} for car ${cs.carId}`);
    await ComingSoon.findByIdAndDelete(id);
    return res.json({ message: 'Promoted to live auction', auction: live });
  } catch (err) {
    console.error('Error in promote route:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;


