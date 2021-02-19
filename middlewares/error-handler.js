const ErrorResponse = require('../utils/error-response')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message

  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404)
  }

  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value entered', 400)
  }

  if (err.name === 'ValidationError') {
    let errorsObj = {}
    for (let [key, value] of Object.entries(err.errors)) {
      errorsObj = {
        ...errorsObj,
        [key]: value.message,
      }
    }
    error = new ErrorResponse(JSON.stringify(errorsObj), 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}

module.exports = errorHandler
