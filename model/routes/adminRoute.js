const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all users (admin only)
router.get('/users', adminController.getAllUsers);

// Delete user (admin only)
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
