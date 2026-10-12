export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

export const handleDuplicateFieldsDB = (err) => {
  // err.keyValue is normally populated, but be defensive: a malformed duplicate
  // error would otherwise throw here and mask the original problem.
  const field = Object.keys(err.keyValue ?? {})[0];
  if (!field) {
    return new AppError('That value already exists. Please use another value.', 400);
  }
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use another value.`;
  
  // Return 409 Conflict for ISBN duplicates as it's a resource conflict
  const statusCode = field === 'isbn' ? 409 : 400;
  return new AppError(message, statusCode);
};

export const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

export const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

export const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

export const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

export const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error('ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};