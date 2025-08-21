const express = require('express');
const router = express.Router();
const Car = require('../models/car'); 


router.post('/carup', async (req, res) => {
  const { name, series, yearReleased, color, image, rarity, price, description, addedBy, auc, inAuction } = req.body;

  try {
    console.log('Request body:', req.body);
    
    const newCar = new Car({
      name,
      series,
      yearReleased,
      color,
      image,
      rarity,
      price,
      description,
      addedBy,
      auc,
      inAuction,
    });

    
    await newCar.save();
    
    
    res.status(201).json(newCar);
  } catch (err) {
    console.error("Error adding car:", err);
    res.status(500).json({ message: 'Error adding car to inventory', error: err.message });
  }
});

module.exports = router;
