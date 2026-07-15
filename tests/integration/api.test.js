const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/config/db');

// Jest mock for DB calls to avoid needing a real DB for integration tests here 
// (or we can just mock the service)
jest.mock('../../src/services/UserService', () => {
    return {
        createUser: jest.fn().mockResolvedValue({ id: '123', name: 'Test', email: 'test@test.com' }),
        getUser: jest.fn().mockResolvedValue({ id: '123', name: 'Test', email: 'test@test.com' }),
        updateUser: jest.fn().mockResolvedValue({ id: '123', name: 'Updated', email: 'test@test.com' }),
        deleteUser: jest.fn().mockResolvedValue(true),
        getEnrichedUser: jest.fn().mockResolvedValue({
            id: '123', name: 'Test', email: 'test@test.com', enrichment: { loyaltyScore: 100 }
        })
    };
});

describe('User API Endpoints', () => {
    it('POST /api/users should create user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ name: 'Test', email: 'test@test.com' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.id).toEqual('123');
    });

    it('GET /api/users/:id should get user', async () => {
        const res = await request(app).get('/api/users/123');
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Test');
    });

    it('GET /api/users/:id/enriched should get enriched user', async () => {
        const res = await request(app).get('/api/users/123/enriched');
        expect(res.statusCode).toEqual(200);
        expect(res.body.enrichment.loyaltyScore).toEqual(100);
    });

    it('POST /api/users should fail on invalid input', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ name: 'Test' }); // Missing email
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorCode).toEqual('INVALID_INPUT');
    });
});
