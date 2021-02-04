const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateNameDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)\1/);
  const message = `Duplicate field value: ${value[0]}, please use another value `;
  return new AppError(message, 400);
};

const handlerValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data, ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token. Please log in again', 401);

const handleExpiredError = (err) =>
  new AppError('Token expired, please login in again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED VIEW
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error('Error: ', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong :(',
    });
  }

  // RENDERED VIEW
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please Try Again',
  });
};

module.exports = (err, req, res, next) => {
  // send back response
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateNameDB(error);

    if (error.name === 'ValidationError')
      error = handlerValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
