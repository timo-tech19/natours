const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview,
} = require('../controllers/reviewController');
const { get } = require('./tourRoutes');

const router = express.Router({ mergeParams: true });

router.use(protect);
router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user'), updateReview);

module.exports = router;
