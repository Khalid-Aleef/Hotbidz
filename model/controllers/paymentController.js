const Payment = require('../models/payment');
const AuctionStore = require('../models/auction_store');
const bcrypt = require('bcrypt'); 
const User = require('../models/user');
const Car = require('../models/car'); 


exports.validatePayment = async (req, res) => {
  try {
    const { auctionId, enteredAmount, password } = req.body;

    
    console.log("Entered Amount:", enteredAmount); 
    console.log("Entered Password:", password); 

    
    const payment = await Payment.findOne({ auctionId }).exec();
    const auction = await AuctionStore.findById(auctionId).exec();

    if (!payment || !auction) {
      return res.status(404).json({ message: "Auction or Payment not found." });
    }

    
    if (enteredAmount !== payment.bidAmount) {
      return res.status(400).json({ message: "Entered amount does not match the bid amount." });
    }

    
    const user = await User.findById(payment.highestBidderId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found for the provided bidder." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password." });
    }


    const car = await Car.findOne({ _id: auction.carId });

    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    
    car.addedBy = payment.highestBidderId.toString(); 
    await car.save(); 

    
    await AuctionStore.deleteOne({ _id: auctionId });
    await Payment.deleteOne({ auctionId });

    return res.status(200).json({ message: "Payment successful and auction closed." });

  } catch (err) {
    console.error('Error processing payment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
