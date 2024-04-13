// Import necessary functions for testing
const { fetchData } = require('./sfiapdgen_func.js');

// Mock the global fetch function
global.fetch = jest.fn();

// Write the unit tests
describe('fetchData function', () => {
    beforeEach(() => {
        // Reset the fetch mock before each test
        jest.clearAllMocks();
    });

    test('should fetch data and parse JSON for a successful response', async () => {
        // Mock a successful JSON response
        const mockData = { key: 'value' };
        const mockResponse = { ok: true, json: jest.fn().mockResolvedValue(mockData) };
        fetch.mockResolvedValue(mockResponse);

        // Call the function and assert the result
        const data = await fetchData('http://example.com/data');
        expect(data).toEqual(mockData);
        expect(fetch).toHaveBeenCalledWith('http://example.com/data');
    });

    test('should throw an error for a non-ok response', async () => {
        // Mock a non-ok response
        const mockResponse = { ok: false, status: 404 };
        fetch.mockResolvedValue(mockResponse);

        // Call the function and expect it to throw an error
        await expect(fetchData('http://example.com/notfound')).rejects.toThrowError('HTTP error! Status: 404');
    });

    test('should log errors during fetch or parsing process', async () => {
        // Mock an error during the fetch process
        const mockError = new Error('Network error');
        fetch.mockRejectedValue(mockError);

        // Call the function and expect it to log the error
        console.error = jest.fn();
        await fetchData('http://example.com/error');
        expect(console.error).toHaveBeenCalledWith('Error fetching data:', mockError);
    });

    test('should handle successful response with empty data', async () => {
        // Mock a successful response with empty data
        const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
        fetch.mockResolvedValue(mockResponse);

        // Call the function and assert the result
        const data = await fetchData('http://example.com/empty');
        expect(data).toEqual({});
    });

    test('should handle JSON parsing error', async () => {
        // Mock a successful response with invalid JSON
        const mockResponse = { ok: true, json: jest.fn().mockRejectedValue(new Error('JSON parsing error')) };
        fetch.mockResolvedValue(mockResponse);

        // Call the function and expect it to throw an error
        await expect(fetchData('http://example.com/invalid')).rejects.toThrowError('JSON parsing error');
    });
});
