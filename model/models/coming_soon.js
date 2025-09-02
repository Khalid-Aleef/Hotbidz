const mongoose = require('mongoose');

const comingSoonSchema = new mongoose.Schema(
  {
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

    start:       { type: Date, required: true },
    end:         { type: Date, required: false },
  },
  { timestamps: true, collection: 'coming_soon' }
);

module.exports = mongoose.model('ComingSoon', comingSoonSchema);


