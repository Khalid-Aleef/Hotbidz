const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const AuctionStore = require('../models/auction_store');
const bidController = require('../controllers/bidController');  
const auctionController = require('../controllers/auctionController'); 
const ComingSoon = require('../models/coming_soon');
const User = require('../models/user'); 



router.post('/', async (req, res) => {
  try {
    const { carId, sellerId, startingBid, endISO, startISO } = req.body;

    if (!carId || !sellerId || !startingBid || !endISO) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    
    const existing = await AuctionStore.findOne({ carId, status: 'open' });
    if (existing) return res.status(400).json({ message: 'This car is already in an open auction' });

    const now = new Date();
    const startDate = startISO ? new Date(startISO) : now;

    if (startDate <= now) {
      const doc = await AuctionStore.create({
        carId,
        sellerId,
        carName: car.name || car.carName,
        year: car.yearReleased || car.year,
        series: car.series,
        rarity: car.rarity,
        image: car.image,
        description: car.description,
        startingBid: Number(startingBid),
        currentBid: startingBid,
        end: new Date(endISO),
        status: 'open',
        cmnt: [] 
      });
      
      
      const seller = await User.findById(sellerId);
      if (seller && seller.fauc === 0) {
        seller.fauc = 1;
        seller.achievements.push("First Auction");
        await seller.save();
      }
      return res.json({ message: 'Auction created', auction: doc });
    }

    
    const csDoc = await ComingSoon.create({
      carId,
      sellerId,
      carName: car.name || car.carName,
      year: car.yearReleased || car.year,
      series: car.series,
      rarity: car.rarity,
      image: car.image,
      description: car.description,
      startingBid: Number(startingBid),
      currentBid: Number(startingBid),
      start: startDate,
      end: new Date(endISO)
    });
    return res.json({ message: 'Scheduled for Coming Soon', comingSoon: csDoc });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});
router.post('/:auctionId/comment', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const { auctionId } = req.params;

    if (!userId || !text) {
      return res.status(400).json({ message: 'userId and text are required' });
    }

    const auction = await AuctionStore.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    
    const user = await User.findById(userId).select('name');
    const userName = user?.name || 'Unknown';

    
    auction.cmnt.push({ userName, text, createdAt: new Date() });
    await auction.save();

    res.json({ message: 'Comment added', auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.post('/:auctionId/like', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { userId } = req.body;

    const auction = await AuctionStore.findById(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    
    if (!auction.likedBy) {
      auction.likedBy = [];
    }

    
    const userLikedIndex = auction.likedBy.indexOf(userId);
    
    if (userLikedIndex === -1) {
      
      auction.likedBy.push(userId);
      auction.likes = (auction.likes || 0) + 1;
      res.json({ message: 'Like added', auction, liked: true });
    } else {
      
      auction.likedBy.splice(userLikedIndex, 1);
      auction.likes = Math.max(0, (auction.likes || 0) - 1);
      res.json({ message: 'Like removed', auction, liked: false });
    }
    
    await auction.save();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query; 

    
    const query = {};
    if (status) {
      query.status = status; 
    }

    
    if (userId) {
      query.sellerId = { $ne: userId }; 
    }

    const auctions = await AuctionStore.find(query)
      .sort({ end: -1 }) 
      .populate('carId', 'carName image')
      .lean();

    auctions.forEach(a => {
      a.cmnt = (a.cmnt || []).map(c => ({
        ...c,
        userName: c.userName || c.userId || 'User' 
      }));
    });
      
      
      

    return res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});



router.post('/bid/:auctionId', bidController.placeBid);
router.post('/end/:auctionId', auctionController.endAuctionAndRecordPayment); 
 

router.delete('/remove/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const deleted = await AuctionStore.findByIdAndDelete(auctionId);
    if (!deleted) return res.status(404).json({ message: 'Auction not found' });
    return res.json({ message: 'Auction removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});
  

module.exports = router;
