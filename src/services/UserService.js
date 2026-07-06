const { v4: uuidv4 } = require('uuid');

class UserService {
    constructor(unitOfWorkFactory, enrichmentClient) {
        this.unitOfWorkFactory = unitOfWorkFactory;
        this.enrichmentClient = enrichmentClient;
    }

    async createUser(userData) {
        const uow = this.unitOfWorkFactory();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            const existingUser = await repo.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('EMAIL_DUPLICATE');
            }

            const newUser = {
                id: uuidv4(),
                name: userData.name,
                email: userData.email,
                registrationDate: new Date()
            };

            const createdUser = await repo.create(newUser);
            await uow.commit();
            return createdUser;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async getUser(id) {
        const uow = this.unitOfWorkFactory();
        const repo = uow.getUserRepository(); // For read, no transaction needed
        const user = await repo.findById(id);
        if (!user) {
            throw new Error('RESOURCE_NOT_FOUND');
        }
        return user;
    }

    async getEnrichedUser(id) {
        const user = await this.getUser(id);
        const enrichmentData = await this.enrichmentClient.getEnrichmentData(id);
        
        return {
            ...user.toJSON(),
            ...enrichmentData
        };
    }

    async updateUser(id, updates) {
        const uow = this.unitOfWorkFactory();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            if (updates.email) {
                const existing = await repo.findByEmail(updates.email);
                if (existing && existing.id !== id) {
                    throw new Error('EMAIL_DUPLICATE');
                }
            }

            const updatedUser = await repo.update(id, updates);
            if (!updatedUser) {
                throw new Error('RESOURCE_NOT_FOUND');
            }

            await uow.commit();
            return updatedUser;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async deleteUser(id) {
        const uow = this.unitOfWorkFactory();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            const success = await repo.delete(id);
            if (!success) {
                throw new Error('RESOURCE_NOT_FOUND');
            }

            await uow.commit();
            return true;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }
}

module.exports = UserService;
