
const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const { processPayment, sendStripeApi } = require('../controllers/paymentController');

router.post('/payment/process',authController.protect, processPayment);
// router.get('/stripeapikey',authController.protect, sendStripeApi);
router.get('/stripeapikey', sendStripeApi);

module.exports = router;
