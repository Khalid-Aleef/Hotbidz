const mongoose = require('mongoose');
const AuctionStore = require('../models/auction_store');
const Payment = require('../models/payment');

exports.endAuctionAndRecordPayment = async (req, res) => {
  const { auctionId } = req.params;  // Auction ID from URL params

  console.log("Received request for auction ID:", auctionId);  // Log the received auctionId

  // Ensure the auctionId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    console.log("Invalid auction ID format");
    return res.status(400).json({ message: 'Invalid auction ID' });
  }

  try {
    // Find the auction by its valid ObjectId
    const auction = await AuctionStore.findById(auctionId).exec();  // Use exec() to ensure it works with promises
    console.log("Fetched auction:", auction);  // Log the auction object

    if (!auction) {
      console.log("Auction not found with the given ID:", auctionId);
      return res.status(404).json({ message: 'Auction not found' });
    }

    // If auction is already being processed, skip the request
    if (auction.processing) {
      console.log("Auction is already being processed:", auctionId);
      return res.status(400).json({ message: 'Auction is already being processed' });
    }

    // Mark the auction as processing to avoid duplicate requests
    auction.processing = true;
    await auction.save();

    // Check if the auction is already closed
    auction.status = 'closed';
    console.log("Marking auction as closed:", auction._id);
    await auction.save();

    // Log auctionId and sellerId to the console
    console.log('Auction ID:', auction._id);
    console.log('Seller ID:', auction.sellerId);

    // Check if a payment already exists for this auction
    const existingPayment = await Payment.findOne({ auctionId: auction._id });
    
    if (existingPayment) {
      console.log(`Payment already exists for auction ID: ${auction._id}`);
      auction.processing = false; // Unlock auction if payment exists
      await auction.save();
      return res.status(400).json({ message: 'Payment already recorded for this auction' });
    }

    // Now create a payment record for the highest bidder
    const payment = new Payment({
      auctionId: auction._id,
      highestBidderId: auction.highestBidder,  // Store the highest bidder's ID
      sellerId: auction.sellerId,
      bidAmount: auction.currentBid,  // Store the highest bid amount
      paymentStatus: 'Pending',  // Payment status initially set to 'Pending'
    });

    // Save the payment record
    console.log("Saving payment record for highest bidder...");
    await payment.save();
    console.log("Payment saved successfully:", payment);

    // Unlock the auction after payment creation
    auction.processing = false;
    await auction.save();

    return res.json({ message: 'Auction closed and payment recorded', payment });
  } catch (err) {
    console.error('Error ending auction and recording payment:', err);
    // In case of an error, make sure the auction is unlocked for future requests
    if (auction && auction.processing) {
      auction.processing = false;
      await auction.save();
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
