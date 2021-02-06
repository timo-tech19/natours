const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        // secure: true,
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        password,
        confirmPassword,
        passwordChangedAt,
        role,
    } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        confirmPassword,
        passwordChangedAt,
        role,
    });

    const url = `${req.protocol}://${req.get('host')}/me `;
    await new Email(newUser, url).sendWelcome();
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!(email && password)) {
        return next(new AppError('Please provide email and password!'), 400);
    }

    // Query identified user
    const user = await User.findOne({ email }).select('+password');

    // check if user exists and if password is correct
    console.log(await user.correctPassword(password, user.password));
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Send token if 200
    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // Get token and check if it exists
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in!, Please login to get access',
                401
            )
        );
    }

    // Validate/Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const foundUser = await User.findById(decoded.id);
    if (!foundUser) {
        return next(new AppError('User no longer exist', 401));
    }
    // Check if user changed password after token was issued
    if (foundUser.changedPassword(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password, Please log in again',
                401
            )
        );
    }

    // Grant access to user
    res.locals.user = foundUser;
    req.user = foundUser;
    next();
});

// Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
    // Get token and check if it exists
    if (req.cookies.jwt) {
        // Validate/Verify token
        try {
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // Check if user still exists
            const foundUser = await User.findById(decoded.id);
            if (!foundUser) {
                return next();
            }
            // Check if user changed password after token was issued
            if (foundUser.changedPassword(decoded.iat)) {
                return next();
            }

            // Grant access to user
            res.locals.user = foundUser;
        } catch (error) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => (req, res, next) => {
    // all roles passed in are stored in an array
    // user role comes from protect middleware where founduser is add to request
    if (!roles.includes(req.user.role)) {
        return next(
            new AppError(
                'You do not have permission to perform this action',
                403
            )
        );
    }
    next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // get user on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('No user with specified email', 404));
    }

    // Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // send it to user email

    // const message = `Forgot your password, Submit a PATCH request with your new password and confirm password to: ${resetURL}.\n If you did not submit a request to change your password, please ignore this email`;
    try {
        // await sendEmail({
        //   email: user.email,
        //   subject: 'Your password reset token (valid for 10mins)',
        //   message,
        // });

        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Please check your email to verify your reset token',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('Error sending email, please try again later', 500)
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get User based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // Set new password if user exists and token still active
    if (!user) {
        return next(
            new AppError(
                'Token invalid or expired, try forgot password again',
                400
            )
        );
    }
    // Update changePasswordAt property for user
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Log user in: send new JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { password, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // validate posted password
    if (!(await user.correctPassword(password, user.password))) {
        return next(new AppError('Password is incorrect', 401));
    }

    // update password if correct
    user.password = newPassword;
    user.confirmPassword = confirmNewPassword;
    await user.save();
    // keep user logged in
    createSendToken(user, 200, res);
});
