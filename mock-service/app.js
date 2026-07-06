const express = require('express');
const app = express();
const port = process.env.MOCK_PORT || 8081;

// Configuration
const failureRate = parseFloat(process.env.MOCK_SERVICE_FAILURE_RATE || "0.0");
const delayMs = parseInt(process.env.MOCK_SERVICE_DELAY_MS || "0", 10);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/enriched', (req, res) => {
    const shouldFail = Math.random() < failureRate;
    
    setTimeout(() => {
        if (shouldFail) {
            // Randomly return 500 or 503
            const status = Math.random() < 0.5 ? 500 : 503;
            return res.status(status).json({
                error: 'Internal Service Error',
                message: 'Mock service random failure'
            });
        }
        
        return res.status(200).json({
            recentActivity: ['login', 'view_profile', 'update_settings'],
            loyaltyScore: Math.floor(Math.random() * 1000)
        });
    }, delayMs);
});

app.listen(port, () => {
    console.log(`Mock enrichment service listening on port ${port}`);
    console.log(`Configured failure rate: ${failureRate}`);
    console.log(`Configured delay (ms): ${delayMs}`);
});
