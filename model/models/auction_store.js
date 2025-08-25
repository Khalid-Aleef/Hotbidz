
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const auctionStoreSchema = new mongoose.Schema(
  {
     processing: {
    type: Boolean,
    default: false,  
     },

    
    carId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    carName:     { type: String, required: true },
    year:        { type: Number },
    series:      { type: String },
    rarity:      { type: String },
    image:       { type: String },
    description: { type: String },

   
    startingBid: { type: Number, required: true },
    minIncBid:   { type: Number, default: 50 },   
    currentBid:  { type: Number, default: 0 },
    end:         { type: Date,   required: true },
    status:      { type: String, enum: ['open', 'closed'], default: 'open' },
    highestBidder:{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'user', 
      default: function() { return this.sellerId; }  
    },


    
    newowner:    { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    cmnt: { type: [commentSchema], default: [] }
  },
  { timestamps: true, collection: 'auction_store' }
);

module.exports = mongoose.model('AuctionStore', auctionStoreSchema);
