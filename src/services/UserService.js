const { v4: uuidv4 } = require('uuid');
const MySQLUnitOfWork = require('../repositories/impl/MySQLUnitOfWork');
const EnrichmentClient = require('../external/EnrichmentClient');

class UserService {
    async createUser(userData) {
        const uow = new MySQLUnitOfWork();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            // Check for duplicate email
            const existing = await repo.findByEmail(userData.email);
            if (existing) {
                const error = new Error('User with this email already exists');
                error.status = 409;
                throw error;
            }

            const newUser = {
                id: uuidv4(),
                name: userData.name,
                email: userData.email
            };

            const created = await repo.create(newUser);
            await uow.commit();
            return created;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async getUser(id) {
        const uow = new MySQLUnitOfWork();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            const user = await repo.findById(id);
            await uow.commit();
            
            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }
            return user;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async updateUser(id, updates) {
        const uow = new MySQLUnitOfWork();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            const existing = await repo.findById(id);
            if (!existing) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            if (updates.email && updates.email !== existing.email) {
                const emailConflict = await repo.findByEmail(updates.email);
                if (emailConflict) {
                    const error = new Error('User with this email already exists');
                    error.status = 409;
                    throw error;
                }
            }

            const updatedUser = await repo.update(id, updates);
            await uow.commit();
            return updatedUser;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async deleteUser(id) {
        const uow = new MySQLUnitOfWork();
        try {
            await uow.startTransaction();
            const repo = uow.getUserRepository();
            
            const deleted = await repo.delete(id);
            await uow.commit();
            
            if (!deleted) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }
            return true;
        } catch (error) {
            await uow.rollback();
            throw error;
        }
    }

    async getEnrichedUser(id) {
        // First get the basic user
        const user = await this.getUser(id);
        
        // Then call external enrichment service
        const enrichedData = await EnrichmentClient.getEnrichmentData(id);
        
        return {
            ...user,
            enrichment: enrichedData
        };
    }
}

module.exports = new UserService();
