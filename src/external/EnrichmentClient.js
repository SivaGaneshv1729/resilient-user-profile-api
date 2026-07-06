const CircuitBreaker = require('opossum');

class EnrichmentClient {
    constructor() {
        this.url = process.env.EXTERNAL_SERVICE_URL || 'http://localhost:8081/enriched';
        this.timeoutMs = parseInt(process.env.EXTERNAL_SERVICE_TIMEOUT_MS || "1500", 10);
        this.maxAttempts = parseInt(process.env.RETRY_MAX_ATTEMPTS || "3", 10);
        this.baseDelayMs = parseInt(process.env.RETRY_BASE_DELAY_MS || "100", 10);

        const breakerOptions = {
            timeout: this.timeoutMs,
            errorThresholdPercentage: 50, 
            resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || "30000", 10),
            volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || "5", 10)
        };

        this.breaker = new CircuitBreaker(this._fetchWithRetry.bind(this), breakerOptions);

        this.breaker.fallback(() => {
            return {
                enrichedDataStatus: 'unavailable',
                message: 'Enrichment service is currently unavailable.'
            };
        });
        
        this.breaker.on('open', () => console.warn('Circuit breaker opened.'));
        this.breaker.on('halfOpen', () => console.info('Circuit breaker half-open.'));
        this.breaker.on('close', () => console.info('Circuit breaker closed.'));
    }

    async getEnrichmentData(userId) {
        return await this.breaker.fire(userId);
    }

    async _fetchWithRetry(userId) {
        let attempt = 0;
        while (attempt < this.maxAttempts) {
            try {
                const response = await fetch(`${this.url}?userId=${userId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(this.timeoutMs)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return {
                    enrichedDataStatus: 'available',
                    ...data
                };
            } catch (error) {
                attempt++;
                if (attempt >= this.maxAttempts) {
                    throw error;
                }
                const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Retry attempt ${attempt} for user ${userId}. Delaying ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

module.exports = EnrichmentClient;
