const UserService = require('../../src/services/UserService');

describe('UserService Unit Tests', () => {
    let mockRepo;
    let mockUnitOfWork;
    let mockEnrichmentClient;
    let userService;
    let mockUowFactory;

    beforeEach(() => {
        mockRepo = {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByEmail: jest.fn()
        };

        mockUnitOfWork = {
            startTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            getUserRepository: jest.fn().mockReturnValue(mockRepo)
        };

        mockUowFactory = jest.fn().mockReturnValue(mockUnitOfWork);

        mockEnrichmentClient = {
            getEnrichmentData: jest.fn()
        };

        userService = new UserService(mockUowFactory, mockEnrichmentClient);
    });

    it('should create a user successfully', async () => {
        const userData = { name: 'Test', email: 'test@example.com' };
        mockRepo.findByEmail.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue({ id: 'uuid-123', ...userData });

        const result = await userService.createUser(userData);

        expect(mockUnitOfWork.startTransaction).toHaveBeenCalled();
        expect(mockRepo.create).toHaveBeenCalled();
        expect(mockUnitOfWork.commit).toHaveBeenCalled();
        expect(result.email).toBe(userData.email);
    });

    it('should throw EMAIL_DUPLICATE when creating an existing user', async () => {
        const userData = { name: 'Test', email: 'test@example.com' };
        mockRepo.findByEmail.mockResolvedValue({ id: 'uuid-456' });

        await expect(userService.createUser(userData)).rejects.toThrow('EMAIL_DUPLICATE');

        expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });

    it('should get enriched user data', async () => {
        mockRepo.findById.mockResolvedValue({
            id: 'uuid-123',
            name: 'Test',
            toJSON: () => ({ id: 'uuid-123', name: 'Test' })
        });
        mockEnrichmentClient.getEnrichmentData.mockResolvedValue({ loyaltyScore: 500 });

        const result = await userService.getEnrichedUser('uuid-123');

        expect(result.id).toBe('uuid-123');
        expect(result.loyaltyScore).toBe(500);
    });
});
