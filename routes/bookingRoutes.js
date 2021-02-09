const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
    getCheckoutSession,
    webhookCheckout,
} = require('../controllers/bookingController');
// const { get } = require('./tourRoutes');

const router = express.Router();

router.get('/checkout-session/:tourId', protect, webhookCheckout);

module.exports = router;
