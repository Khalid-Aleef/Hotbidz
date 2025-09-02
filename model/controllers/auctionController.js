const mongoose = require('mongoose');
const AuctionStore = require('../models/auction_store');
const Payment = require('../models/payment');
const User = require('../models/user');

exports.endAuctionAndRecordPayment = async (req, res) => {
  const { auctionId } = req.params;  

  console.log("Received request for auction ID:", auctionId);  

  
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    console.log("Invalid auction ID format");
    return res.status(400).json({ message: 'Invalid auction ID' });
  }

  try {
    
    const auction = await AuctionStore.findById(auctionId).exec();  
    console.log("Fetched auction:", auction);  

    if (!auction) {
      console.log("Auction not found with the given ID:", auctionId);
      return res.status(404).json({ message: 'Auction not found' });
    }

    
    if (auction.processing) {
      console.log("Auction is already being processed:", auctionId);
      return res.status(400).json({ message: 'Auction is already being processed' });
    }

    
    auction.processing = true;
    await auction.save();

    // If highest bidder is the seller, remove auction without payment
    if (auction.highestBidder && String(auction.highestBidder) === String(auction.sellerId)) {
      await AuctionStore.findByIdAndDelete(auction._id);
      return res.json({ message: 'Auction removed (seller was highest bidder)' });
    }

    auction.status = 'closed';
    console.log("Marking auction as closed:", auction._id);
    await auction.save();

    
    console.log('Auction ID:', auction._id);
    console.log('Seller ID:', auction.sellerId);

    
    const existingPayment = await Payment.findOne({ auctionId: auction._id });
    
    if (existingPayment) {
      console.log(`Payment already exists for auction ID: ${auction._id}`);
      auction.processing = false; 
      await auction.save();
      return res.status(400).json({ message: 'Payment already recorded for this auction' });
    }

    
    const payment = new Payment({
      auctionId: auction._id,
      highestBidderId: auction.highestBidder,  
      sellerId: auction.sellerId,
      bidAmount: auction.currentBid,  
      paymentStatus: 'Pending',  
    });

    
    
    
    const highestBidderr = await User.findById(auction.highestBidder);
    if (highestBidderr && highestBidderr.fwon === 0) {
      highestBidderr.fwon = 1;
      highestBidderr.achievements.push("1st Won");
      await highestBidderr.save();
    }

    console.log("Saving payment record for highest bidder...");
    await payment.save();
    console.log("Payment saved successfully:", payment);

    
    auction.processing = false;
    await auction.save();

    return res.json({ message: 'Auction closed and payment recorded', payment });
  } catch (err) {
    console.error('Error ending auction and recording payment:', err);
    
    if (auction && auction.processing) {
      auction.processing = false;
      await auction.save();
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
