const CircuitBreaker = require('opossum');
const axios = require('axios');
require('dotenv').config();

const EXTERNAL_URL = process.env.EXTERNAL_SERVICE_URL || 'http://localhost:8081/enrich';
const TIMEOUT_MS = parseInt(process.env.EXTERNAL_SERVICE_TIMEOUT_MS || '1500', 10);
const FAILURE_THRESHOLD = parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '3', 10);
const RESET_TIMEOUT_MS = parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || '10000', 10);

const RETRY_ATTEMPTS = parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10);
const RETRY_DELAY_MS = parseInt(process.env.RETRY_BASE_DELAY_MS || '100', 10);

// Core function that actually makes the request, with retry logic
const fetchWithRetry = async (userId) => {
    let attempt = 0;
    while (attempt <= RETRY_ATTEMPTS) {
        try {
            console.log(`[EnrichmentClient] Fetching data for ${userId}, attempt ${attempt + 1}`);
            const response = await axios.get(EXTERNAL_URL, {
                params: { userId },
                timeout: TIMEOUT_MS
            });
            return response.data;
        } catch (error) {
            attempt++;
            if (attempt > RETRY_ATTEMPTS) {
                console.error(`[EnrichmentClient] Failed after ${RETRY_ATTEMPTS} retries for ${userId}`);
                throw error; // Let circuit breaker catch this
            }
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
            console.warn(`[EnrichmentClient] Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const breakerOptions = {
    timeout: TIMEOUT_MS * (RETRY_ATTEMPTS + 1) + 2000, // Breaker timeout > total retry time
    errorThresholdPercentage: 50, 
    volumeThreshold: FAILURE_THRESHOLD, // Minimum number of requests before circuit checks error percentage
    resetTimeout: RESET_TIMEOUT_MS
};

const breaker = new CircuitBreaker(fetchWithRetry, breakerOptions);

// Fallback when circuit is open or request fails
breaker.fallback((userId, err) => {
    console.log(`[EnrichmentClient] Circuit breaker fallback triggered for ${userId}. Reason: ${err.message}`);
    return {
        enrichedDataStatus: 'unavailable',
        message: 'External service is currently unavailable or circuit is open'
    };
});

breaker.on('open', () => console.error('[EnrichmentClient] CIRCUIT BREAKER OPENED'));
breaker.on('halfOpen', () => console.warn('[EnrichmentClient] CIRCUIT BREAKER HALF-OPEN'));
breaker.on('close', () => console.log('[EnrichmentClient] CIRCUIT BREAKER CLOSED'));

class EnrichmentClient {
    async getEnrichmentData(userId) {
        return await breaker.fire(userId);
    }
}

module.exports = new EnrichmentClient();
