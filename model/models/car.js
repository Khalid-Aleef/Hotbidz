const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  series: { type: String, required: true },                
  yearReleased: { type: Number, required: true },  
  modelNumber: String,           
  color: String,
  image: String,                   
  rarity: { type: String, enum: ['Common', 'Uncommon', 'Rare', 'Super Treasure Hunt', 'Limited Edition'], default: 'Common' },
  price: { type: Number, required: true },  
  description: String,
  addedBy: { type: String, required: true },  
  auc: { type: Number, default: 0 }, 
  end: Date,
  inAuction: { type: Boolean, default: false },
});

module.exports = mongoose.model('Car', carSchema);
