const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');  


router.post('/validate', paymentController.validatePayment);

module.exports = router;
