class ApiError extends Error {
  constructor(statusCode, errorCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isApiError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
