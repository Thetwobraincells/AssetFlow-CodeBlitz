const { ZodError } = require('zod');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // If it's our custom ApiError
  if (err.isApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
  }

  // Prisma Errors
  if (err.code) {
    // Unique constraint failed
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'UNIQUE_CONSTRAINT_FAILED',
          message: 'A record with this value already exists.',
          details: err.meta,
        }
      });
    }
  }

  // Postgres native error code for exclusion violation
  // Prisma surfaces this sometimes in err.meta.code or err.code depending on if it's a raw query
  if (err.code === '23P01' || (err.meta && err.meta.code === '23P01')) {
    return res.status(409).json({
      error: {
        code: 'BOOKING_OVERLAP',
        message: 'This asset is already booked for the specified time range.',
      }
    });
  }

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: message,
    },
  });
};

module.exports = errorMiddleware;
