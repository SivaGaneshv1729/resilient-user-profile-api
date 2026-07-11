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

});
