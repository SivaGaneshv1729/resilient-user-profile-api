const express = require('express');
const app = express();
const port = process.env.MOCK_PORT || 8081;

// Configurable simulated behaviors
const failureRate = parseFloat(process.env.MOCK_SERVICE_FAILURE_RATE || '0.0');
const delayMs = parseInt(process.env.MOCK_SERVICE_DELAY_MS || '0', 10);

console.log(`Starting mock service with failureRate=${failureRate}, delayMs=${delayMs}`);

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/enrich', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    // Simulate delay
    if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Simulate failure
    if (Math.random() < failureRate) {
        console.log(`[Mock Service] Simulating 503 failure for userId=${userId}`);
        return res.status(503).json({ error: 'Service Unavailable' });
    }

    // Success response
    console.log(`[Mock Service] Returning enriched data for userId=${userId}`);
    return res.status(200).json({
        userId,
        recentActivity: ['login', 'profile_update', 'purchase'],
        loyaltyScore: Math.floor(Math.random() * 1000)
    });
});

app.listen(port, () => {
    console.log(`Mock enrichment service listening on port ${port}`);
});
