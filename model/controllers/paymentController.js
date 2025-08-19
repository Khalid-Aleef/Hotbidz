const Payment = require('../models/payment');
const AuctionStore = require('../models/auction_store');
const bcrypt = require('bcrypt'); // Make sure bcrypt is required for password comparison
const User = require('../models/user');
const Car = require('../models/car'); // Assuming you have a User model to validate passwords

// Controller function for validating the payment
exports.validatePayment = async (req, res) => {
  try {
    const { auctionId, enteredAmount, password } = req.body;

    // Log the values received
    console.log("Entered Amount:", enteredAmount); // Log the entered amount from user
    console.log("Entered Password:", password); // Log the password received

    // Step 1: Fetch the payment and auction details based on auctionId
    const payment = await Payment.findOne({ auctionId }).exec();
    const auction = await AuctionStore.findById(auctionId).exec();

    if (!payment || !auction) {
      return res.status(404).json({ message: "Auction or Payment not found." });
    }

    // Step 2: Validate the entered amount with the bid amount
    if (enteredAmount !== payment.bidAmount) {
      return res.status(400).json({ message: "Entered amount does not match the bid amount." });
    }

    // Step 3: Validate password
    const user = await User.findById(payment.highestBidderId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found for the provided bidder." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // Step 4: Update the car's addedBy field with highestBidderId
    const car = await Car.findOne({ _id: auction.carId });

    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    // Update the 'addedBy' field of the car with the highest bidder's ID
    car.addedBy = payment.highestBidderId.toString(); // Ensure it's stored as a string
    await car.save(); 

    // Step 5: Delete the auction and payment
    await AuctionStore.deleteOne({ _id: auctionId });
    await Payment.deleteOne({ auctionId });

    return res.status(200).json({ message: "Payment successful and auction closed." });

  } catch (err) {
    console.error('Error processing payment:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
