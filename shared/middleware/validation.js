const { error } = require('../utils/response');
const { STATUS_CODES } = require('../constants');

/**
 * Middleware to validate request body against validator function
 * @param {Function} validatorFn - Validator function that returns errors array
 */
const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    
    if (errors.length > 0) {
      return error(res, 'Validation failed', STATUS_CODES.BAD_REQUEST, errors);
    }
    
    next();
  };
};

/**
 * Middleware to validate query parameters
 * @param {Function} validatorFn - Validator function
 */
const validateQuery = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.query);
    
    if (errors.length > 0) {
      return error(res, 'Validation failed', STATUS_CODES.BAD_REQUEST, errors);
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
};
