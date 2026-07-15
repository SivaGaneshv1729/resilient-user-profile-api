const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
});

const userUpdateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email()
}).min(1);

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const details = error.details.map(d => d.message);
            return res.status(400).json({
                errorCode: 'INVALID_INPUT',
                message: 'Validation failed',
                details
            });
        }
        next();
    };
};

module.exports = {
    userSchema,
    userUpdateSchema,
    validateRequest
};
