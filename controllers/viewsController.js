const Booking = require('../models/bookingsModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    // get tour data from DB
    const tours = await Tour.find();
    // Build template

    // render template using tour

    res.status(200).render('overview', {
        title: 'Exciting tours for adventurous people',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // Request tour using the slug
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    // Display tour

    if (!tour) {
        return next(new AppError('No tour with that name', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

exports.login = (req, res, next) => {
    // send llogin form
    res.status(200).render('login', {
        title: 'Log Into Your Account',
    });
};

exports.signup = (req, res, next) => {
    // send llogin form
    res.status(200).render('signup', {
        title: 'Sign up a new account',
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    // Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // Find tours with the returned IDs
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser,
    });
});

exports.alerts = (req, res, next) => {
    const { alert } = req.params;

    if (alert === 'booking')
        req.locals.alert = `Tour has been booked, if tour doesn't show up immediately in "My Tours" please wait a few minutes and reload the page`;
    next();
};
