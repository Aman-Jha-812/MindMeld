export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';

  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        statusCode = 413;
        message = 'File too large. Maximum size is 50MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        statusCode = 400;
        message = 'Too many files. Maximum is 5 files.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        statusCode = 400;
        message = 'Unexpected file field.';
        break;
      default:
        statusCode = 400;
        message = `Upload error: ${err.message}`;
    }
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  statusCode = err.statusCode || statusCode;

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
