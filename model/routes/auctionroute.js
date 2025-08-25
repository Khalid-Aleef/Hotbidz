const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const AuctionStore = require('../models/auction_store');
const bidController = require('../controllers/bidController');  
const auctionController = require('../controllers/auctionController'); 
const User = require('../models/user'); 



router.post('/', async (req, res) => {
  try {
    const { carId, sellerId, startingBid, endISO } = req.body;

    if (!carId || !sellerId || !startingBid || !endISO) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    
    const existing = await AuctionStore.findOne({ carId, status: 'open' });
    if (existing) return res.status(400).json({ message: 'This car is already in an open auction' });

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

    return res.json({ message: 'Auction created', auction: doc });
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

    // ✅ fetch the user’s name
    const user = await User.findById(userId).select('name');
    const userName = user?.name || 'Unknown';

    // ✅ push comment with userName, not userId
    auction.cmnt.push({ userName, text, createdAt: new Date() });
    await auction.save();

    res.json({ message: 'Comment added', auction });
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
        userName: c.userName || c.userId || 'User' // <- fallback to old field
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
  

module.exports = router;
