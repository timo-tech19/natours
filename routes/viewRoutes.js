const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBoookingCheckout } = require('../controllers/bookingController');
const {
    getOverview,
    getTour,
    login,
    getAccount,
    getMyTours,
    alerts,
} = require('../controllers/viewsController');

const router = express.Router();

router.use(alerts);

router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.use(isLoggedIn);
// View Routes
router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', login);

module.exports = router;
