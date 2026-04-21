const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  req.body = value;
  next();
};

// Query validation middleware factory
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({
      error: 'Query validation failed',
      details,
    });
  }

  req.query = value;
  next();
};

module.exports = {
  validate,
  validateQuery,
};
