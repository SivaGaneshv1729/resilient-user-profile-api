const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

jest.setTimeout(60000);

describe('User API Integration Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
        const mongoUri = mongoServer.getUri();
        
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
        }
        
        await User.deleteMany({});
        global.fetch = jest.fn();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    beforeEach(async () => {
        await User.deleteMany({});
        jest.clearAllMocks();
    });

    describe('POST /api/users', () => {
        it('should return 400 for invalid input', async () => {
            const res = await request(app).post('/api/users').send({ name: 'Test' });
            expect(res.statusCode).toBe(400);
            expect(res.body.errorCode).toBe('INVALID_INPUT');
        });

        it('should create user and return 201', async () => {
            const res = await request(app).post('/api/users').send({ name: 'Test', email: 'test@example.com' });
            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe('Test');
            expect(res.body.id).toBeDefined();
        });

        it('should return 409 if email is duplicate', async () => {
            await request(app).post('/api/users').send({ name: 'Test1', email: 'duplicate@example.com' });
            const res = await request(app).post('/api/users').send({ name: 'Test2', email: 'duplicate@example.com' });
            expect(res.statusCode).toBe(409);
            expect(res.body.errorCode).toBe('EMAIL_DUPLICATE');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get an existing user', async () => {
            const createRes = await request(app).post('/api/users').send({ name: 'Bob', email: 'bob@example.com' });
            const userId = createRes.body.id;

            const res = await request(app).get(`/api/users/${userId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Bob');
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app).get('/api/users/not-found-id');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update an existing user', async () => {
            const createRes = await request(app).post('/api/users').send({ name: 'Alice', email: 'alice@example.com' });
            const userId = createRes.body.id;

            const res = await request(app).put(`/api/users/${userId}`).send({ name: 'Alice Updated' });
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Alice Updated');
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete an existing user', async () => {
            const createRes = await request(app).post('/api/users').send({ name: 'Charlie', email: 'charlie@example.com' });
            const userId = createRes.body.id;

            const res = await request(app).delete(`/api/users/${userId}`);
            expect(res.statusCode).toBe(204);

            const getRes = await request(app).get(`/api/users/${userId}`);
            expect(getRes.statusCode).toBe(404);
        });
    });

    describe('GET /api/users/:id/enriched', () => {
        let userId;

        beforeEach(async () => {
            const createRes = await request(app).post('/api/users').send({ name: 'Dave', email: 'dave@example.com' });
            userId = createRes.body.id;
        });

        it('should return enriched data on success', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ recentActivity: ['login'], loyaltyScore: 100 })
            });

            const res = await request(app).get(`/api/users/${userId}/enriched`);
            expect(res.statusCode).toBe(200);
            expect(res.body.enrichedDataStatus).toBe('available');
            expect(res.body.loyaltyScore).toBe(100);
        });

        it('should handle transient errors via retry and then succeed', async () => {
            global.fetch
                .mockRejectedValueOnce(new Error('Transient Network Error'))
                .mockRejectedValueOnce(new Error('Transient Network Error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ recentActivity: ['login'], loyaltyScore: 200 })
                });

            const res = await request(app).get(`/api/users/${userId}/enriched`);
            expect(res.statusCode).toBe(200);
            expect(res.body.enrichedDataStatus).toBe('available');
            expect(res.body.loyaltyScore).toBe(200);
            expect(global.fetch).toHaveBeenCalledTimes(3);
        }, 10000); 

        it('should open circuit breaker on continuous failures and return fallback', async () => {
            global.fetch.mockRejectedValue(new Error('Permanent Failure'));

            await request(app).get(`/api/users/${userId}/enriched`);
            await request(app).get(`/api/users/${userId}/enriched`);

            const res = await request(app).get(`/api/users/${userId}/enriched`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.enrichedDataStatus).toBe('unavailable');
            expect(res.body.message).toBeDefined();
        }, 15000); 
    });

});
