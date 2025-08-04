// /backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sex: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  ownedCar: { type: Number, default: 0 },
  type: { type: String, default: "Fresh" },
  profileImage: {type: String} ,
  carInventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  achievements: {
    type: [String],
    default: []
  }
 

  
});

module.exports = mongoose.model('user', userSchema);