const express = require('express');
const User = require('../models/user'); // your User model
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get user by ID
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;