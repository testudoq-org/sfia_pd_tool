// Import necessary functions for testing
const { fetchData } = require('./sfiapdgen_func.js');

describe('fetchData function', () => {
    beforeEach(() => {
        jest.resetAllMocks(); // Reset the fetch mock before each test
        global.fetch = jest.fn();
    });

    test('should fetch data and parse JSON for a successful response', async () => {
        const mockData = { key: 'value' };
        const mockResponse = { ok: true, json: jest.fn().mockResolvedValue(mockData) };
        global.fetch.mockResolvedValue(mockResponse);

        const data = await fetchData('http://example.com/data');

        expect(data).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith('http://example.com/data');
    });

    test('should throw an error for a non-ok response', async () => {
        const mockResponse = { ok: false, status: 404 };
        global.fetch.mockResolvedValue(mockResponse);

        await expect(fetchData('http://example.com/notfound')).rejects.toThrowError('HTTP error! Status: 404');
        expect(global.fetch).toHaveBeenCalledWith('http://example.com/notfound');
    });

    test('should handle successful response with empty data', async () => {
        const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
        global.fetch.mockResolvedValue(mockResponse);

        const data = await fetchData('http://example.com/empty');
        expect(data).toEqual({});
    });

    test('should handle JSON parsing error', async () => {
        const mockResponse = { ok: true, json: jest.fn().mockRejectedValue(new Error('JSON parsing error')) };
        global.fetch.mockResolvedValue(mockResponse);

        await expect(fetchData('http://example.com/invalid')).rejects.toThrowError('JSON parsing error');
    });
});
