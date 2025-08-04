const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: String,
  series: String,                 
  yearReleased: Number,
  modelNumber: String,           
  color: String,
  image: String,                   
  rarity: { type: String, enum: ['Common', 'Rare', 'Super Treasure Hunt'], default: 'Common' },
  price: Number,
  description: String,
  addedBy: {type: String } // Who added this to DB
});

module.exports = mongoose.model('Car', carSchema);
