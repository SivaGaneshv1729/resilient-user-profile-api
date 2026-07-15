const axios = require('axios');
const EnrichmentClient = require('../../src/external/EnrichmentClient');

jest.mock('axios');

describe('EnrichmentClient Resilience', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return data successfully on first try', async () => {
        axios.get.mockResolvedValue({ data: { loyaltyScore: 500 } });
        const data = await EnrichmentClient.getEnrichmentData('user-1');
        expect(data).toEqual({ loyaltyScore: 500 });
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
        // Fail twice, succeed on third
        axios.get
            .mockRejectedValueOnce(new Error('Network Error'))
            .mockRejectedValueOnce(new Error('Network Error'))
            .mockResolvedValueOnce({ data: { loyaltyScore: 200 } });

        const data = await EnrichmentClient.getEnrichmentData('user-1');
        expect(data).toEqual({ loyaltyScore: 200 });
        expect(axios.get).toHaveBeenCalledTimes(3);
    });

    it('should fallback when all retries fail', async () => {
        // Always fail
        axios.get.mockRejectedValue(new Error('Service Down'));

        const data = await EnrichmentClient.getEnrichmentData('user-1');
        expect(data.enrichedDataStatus).toBe('unavailable');
        // It should attempt 4 times total (1 initial + 3 retries based on max attempts = 3)
        expect(axios.get).toHaveBeenCalledTimes(4);
    }, 10000); // give it time for retries
});
