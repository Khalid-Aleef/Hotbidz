
const AuctionStore = require('../models/auction_store');  
const User = require('../models/user');

exports.placeBid = async (req, res) => {
  const { auctionId } = req.params;  
  const { userId, bidAmount } = req.body;  

  
  const user = await User.findById(userId);
  if (user) {
    user.totalbid += 1;
    
    
    if (user.totalbid === 5) {
      user.achievements.push("Rookie Bidder");
    } else if (user.totalbid === 10) {
      user.achievements.push("Bidder");
    } else if (user.totalbid === 15) {
      user.achievements.push("Pro Bidder");
    } else if (user.totalbid === 20) {
      user.achievements.push("Bid Master");
    }
    
    await user.save();
  }

  console.log("Received bid request:", { auctionId, userId, bidAmount });  

  try {
    const auction = await AuctionStore.findById(auctionId);
    if (!auction) {
      console.log("Auction not found");
      return res.status(404).json({ message: 'Auction not found' });
    }

    
    if (auction.status === 'closed') {
      console.log("Auction is closed");
      return res.status(400).json({ message: 'Auction is closed, cannot place bid.' });
    }

    
    const minBid = auction.currentBid + auction.minIncBid;
    if (bidAmount < minBid) {
      console.log(`Bid too low. Must be at least ${minBid}`);
      return res.status(400).json({ message: `Bid must be at least ${minBid} BDT.` });
    }

    
    auction.currentBid = bidAmount;
    auction.highestBidder = userId;

    await auction.save();

    res.json({ message: 'Bid placed successfully', auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
