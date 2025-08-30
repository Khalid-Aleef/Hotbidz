
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sex: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  ownedCar: { type: Number, default: 0 },
  type: { type: String, default: "Fresh" },
  profileImage: {type: String} ,
  totalcar:{ type: Number, default: 0 },
  carInventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  achievements: {
    type: [String],
    default: []
  },
  fauc:{ type: Number, default: 0 },
  fwon:{ type: Number, default: 0 },
  totalbid:{ type: Number, default: 0 }
 

  
});

module.exports = mongoose.model('user', userSchema);