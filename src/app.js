require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const errorHandler = require('./middleware/errorHandler');
const setupUserRoutes = require('./routes/userRoutes');
const UserController = require('./controllers/UserController');
const UserService = require('./services/UserService');
const EnrichmentClient = require('./external/EnrichmentClient');
const MongoUnitOfWork = require('./repositories/impl/MongoUnitOfWork');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Dependency Injection
const unitOfWorkFactory = () => new MongoUnitOfWork();
const enrichmentClient = new EnrichmentClient();
const userService = new UserService(unitOfWorkFactory, enrichmentClient);
const userController = new UserController(userService);

app.use('/api/users', setupUserRoutes(userController));

// Error Handling Middleware
app.use(errorHandler);

const port = process.env.PORT || 8080;
const dbUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

if (require.main === module) {
    mongoose.connect(dbUri)
        .then(async () => {
            console.log('Connected to MongoDB');

            // Database seeding
            const User = require('./models/User');
            const count = await User.countDocuments();
            if (count === 0) {
                console.log('Seeding initial database data...');
                await User.insertMany([
                    { id: 'user-1', name: 'Alice Wonderland', email: 'alice@example.com' },
                    { id: 'user-2', name: 'Bob The Builder', email: 'bob@example.com' },
                    { id: 'user-3', name: 'Charlie Chaplin', email: 'charlie@example.com' }
                ]);
                console.log('Database seeded successfully.');
            }

            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });
        })
        .catch((error) => {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        });
}

module.exports = app;
