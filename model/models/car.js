const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Make name required
  series: { type: String, required: true }, // Make series required                 
  yearReleased: { type: Number, required: true },  // Make yearReleased required
  modelNumber: String,           
  color: String,
  image: String,                   
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Super Treasure Hunt', 'Limited Edition'], default: 'Common' },
  price: { type: Number, required: true },  // Make price required
  description: String,
  addedBy: { type: String, required: true },  // Ensure addedBy is always provided (user ID as string)
  auc: { type: Number, default: 0 }, 
  end: Date,
  inAuction: { type: Boolean, default: false },
});

module.exports = mongoose.model('Car', carSchema);
