const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const AuctionStore = require('../models/auction_store');
const bidController = require('../controllers/bidController');  
const auctionController = require('../controllers/auctionController'); // Import the placeBid controller

// POST /api/auction-store/start
// body: { carId, sellerId, startingBid, endISO }
router.post('/', async (req, res) => {
  try {
    const { carId, sellerId, startingBid, endISO } = req.body;

    if (!carId || !sellerId || !startingBid || !endISO) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // (optional) disallow duplicates if already in auction
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
      status: 'open'
    });

    return res.json({ message: 'Auction created', auction: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// GET /api/auction-store
// Fetch all auctions or filter by status ('open', 'closed')
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query; // Accept status and userId as query params, e.g., ?status=open&userId=123

    // Create query object for filtering auctions
    const query = {};
    if (status) {
      query.status = status; // If status is provided in query, filter by status
    }

    // If userId is provided, filter out auctions where the user is the seller
    if (userId) {
      query.sellerId = { $ne: userId }; // $ne operator ensures we don't fetch auctions where sellerId matches the userId
    }

    const auctions = await AuctionStore.find(query)
      .sort({ end: -1 }) // Sort by end time in descending order
      .populate('carId', 'carName image'); // Populate car details if needed

    return res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// POST /api/auction-store/bid/:auctionId
// Place a bid for an auction
router.post('/bid/:auctionId', bidController.placeBid);
router.post('/end/:auctionId', auctionController.endAuctionAndRecordPayment); 
  // Add this route for placing a bid

module.exports = router;
