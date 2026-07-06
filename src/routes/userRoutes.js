const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');

const createUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
});

const updateUserSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email()
}).min(1);

function setupUserRoutes(userController) {
    const router = express.Router();

    router.post('/', validate(createUserSchema), (req, res, next) => userController.createUser(req, res, next));
    router.get('/:id', (req, res, next) => userController.getUser(req, res, next));
    router.get('/:id/enriched', (req, res, next) => userController.getEnrichedUser(req, res, next));
    router.put('/:id', validate(updateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
    router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

    return router;
}

module.exports = setupUserRoutes;
