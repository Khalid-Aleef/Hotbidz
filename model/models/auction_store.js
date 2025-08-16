// model/models/auctionStore.js
const mongoose = require('mongoose');

const auctionStoreSchema = new mongoose.Schema(
  {
     processing: {
    type: Boolean,
    default: false,  // Default value is false, auction is not being processed
     },

    // snapshot (so auction card still shows even if car doc later changes)
    carId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    carName:     { type: String, required: true },
    year:        { type: Number },
    series:      { type: String },
    rarity:      { type: String },
    image:       { type: String },
    description: { type: String },

    // auction fields
    startingBid: { type: Number, required: true },
    minIncBid:   { type: Number, default: 50 },   // you can change
    currentBid:  { type: Number, default: 0 },
    end:         { type: Date,   required: true },
    status:      { type: String, enum: ['open', 'closed'], default: 'open' },
    highestBidder:{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      default: function() { return this.sellerId; }  // Defaults to sellerId
    },


    // optional
    newowner:    { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  },
  { timestamps: true, collection: 'auction_store' }
);

module.exports = mongoose.model('AuctionStore', auctionStoreSchema);
