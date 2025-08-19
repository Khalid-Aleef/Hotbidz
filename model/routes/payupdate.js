const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');  // Import your controller

// Route to handle payment validation
router.post('/validate', paymentController.validatePayment);

module.exports = router;
