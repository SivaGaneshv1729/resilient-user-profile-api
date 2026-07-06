const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return next(error); // Pass error to the error handler
        }
        req.body = value; // Replace req.body with validated value (can apply defaults)
        next();
    };
};

module.exports = validate;
