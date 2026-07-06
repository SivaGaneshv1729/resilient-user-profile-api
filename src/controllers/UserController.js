class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async createUser(req, res, next) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await this.userService.getUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async getEnrichedUser(req, res, next) {
        try {
            const user = await this.userService.getEnrichedUser(req.params.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await this.userService.deleteUser(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
