// controllers/bidController.js
const AuctionStore = require('../models/auction_store');  // Import AuctionStore model

exports.placeBid = async (req, res) => {
  const { auctionId } = req.params;  // Auction ID from the URL
  const { userId, bidAmount } = req.body;  // User's ID and the bid amount from the request body

  console.log("Received bid request:", { auctionId, userId, bidAmount });  // Log the request

  try {
    const auction = await AuctionStore.findById(auctionId);
    if (!auction) {
      console.log("Auction not found");
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if the auction is open
    if (auction.status === 'closed') {
      console.log("Auction is closed");
      return res.status(400).json({ message: 'Auction is closed, cannot place bid.' });
    }

    // Check if the bid is valid
    const minBid = auction.currentBid + auction.minIncBid;
    if (bidAmount < minBid) {
      console.log(`Bid too low. Must be at least ${minBid}`);
      return res.status(400).json({ message: `Bid must be at least ${minBid} BDT.` });
    }

    // Update the auction with the new bid
    auction.currentBid = bidAmount;
    auction.highestBidder = userId;

    await auction.save();

    res.json({ message: 'Bid placed successfully', auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
