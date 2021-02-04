const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

exports.setTourAndUserIds = (req, res, next) => {
  // Get data from user
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user.id;
  next();
};

// Review routes
exports.getReviews = getAll(Review);
exports.getReview = getOne(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);