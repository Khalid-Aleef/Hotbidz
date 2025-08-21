const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuctionStore', required: true },
  highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Pending' },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;