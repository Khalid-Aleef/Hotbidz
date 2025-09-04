
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/signup', async (req, res) => {
  const { name, sex, email, password } = req.body;

  if (!name || !sex || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      ownedCar: 0,
      sex,
      type: "Fresh",
      email: normalizedEmail,
      password: hashedPassword,
      profileImage: "./Userdp/userdp.jpeg",
      achievements: [],
    });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    //  admin login
    if (email === 'admin' && password === 'admin') {
      return res.json({ message: 'Admin login successful', isAdmin: true, userId: 'admin' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', userId: user._id, isAdmin: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


module.exports = router;
