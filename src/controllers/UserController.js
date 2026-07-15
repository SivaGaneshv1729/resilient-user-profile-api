const UserService = require('../services/UserService');

class UserController {
    async createUser(req, res, next) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await UserService.getUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await UserService.deleteUser(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getEnrichedUser(req, res, next) {
        try {
            const user = await UserService.getEnrichedUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
