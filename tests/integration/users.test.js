const request = require('supertest');
const express = require('express');
const setupUserRoutes = require('../../src/routes/userRoutes');
const errorHandler = require('../../src/middleware/errorHandler');
const UserController = require('../../src/controllers/UserController');

const mockUserService = {
    createUser: jest.fn(),
    getUser: jest.fn(),
    getEnrichedUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
};

const userController = new UserController(mockUserService);

const app = express();
app.use(express.json());
// Inject mocked service via controller
app.use('/api/users', setupUserRoutes(userController));
app.use(errorHandler);

describe('User API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/users', () => {
        it('should return 400 for invalid input', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({ name: 'Test' }); // Missing email

            expect(res.statusCode).toBe(400);
            expect(res.body.errorCode).toBe('INVALID_INPUT');
        });

        it('should create user and return 201', async () => {
            mockUserService.createUser.mockResolvedValue({ id: '123', name: 'Test', email: 'test@example.com' });

            const res = await request(app)
                .post('/api/users')
                .send({ name: 'Test', email: 'test@example.com' });

            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBe('123');
        });

        it('should return 409 if email is duplicate', async () => {
            mockUserService.createUser.mockRejectedValue(new Error('EMAIL_DUPLICATE'));

            const res = await request(app)
                .post('/api/users')
                .send({ name: 'Test', email: 'test@example.com' });

            expect(res.statusCode).toBe(409);
            expect(res.body.errorCode).toBe('EMAIL_DUPLICATE');
        });
    });

    describe('GET /api/users/:id/enriched', () => {
        it('should return 503 if enrichment service is unavailable', async () => {
            mockUserService.getEnrichedUser.mockRejectedValue(new Error('HTTP error! status: 503'));

            const res = await request(app).get('/api/users/123/enriched');

            expect(res.statusCode).toBe(503);
            expect(res.body.errorCode).toBe('SERVICE_UNAVAILABLE');
        });
    });
});
