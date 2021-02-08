const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

// View Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// serve static files to client
app.use(express.static(path.join(__dirname, 'public')));

// Middleware code between request and response
// Required to access request body(body-parser)

// Set secure http headers
// app.use(helmet());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Parse Request body
app.use(express.json({ limit: '10kb' }));

// Allow cookie to be parsed in browser
app.use(cookieParser());

// Data Sanitization
// NoSQL query injecttion
app.use(mongoSanitize());
// XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(compression());

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit request
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();

    // console.log(req.headers);
    next();
});

// Mount Routes(Resources)
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found on server`), 404);
});

// Error handling middleware
// Receives 4 arguments
app.use(globalErrorHandler);

module.exports = app;
