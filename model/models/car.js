const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: String,
  series: String,                 
  yearReleased: Number,
  modelNumber: String,           
  color: String,
  image: String,                   
  rarity: { type: String, enum: ['Common', 'Uncommon','Rare', 'Super Treasure Hunt'], default: 'Common' },
  price: Number,
  description: String,
  addedBy: {type: String }, 
  auc: Number,
  end: Date,
  inAuction: { type: Boolean, default: false }, 

});

module.exports = mongoose.model('Car', carSchema);
