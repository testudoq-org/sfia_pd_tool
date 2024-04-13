// Import necessary functions for testing
const { initializeSFIAContent, setupEventListeners } = require('./sfiapdgen_func.js');

// Import the function to test
const changeJsonVersion = require('sfiapdgen_func.js');

// Mock the necessary global objects and functions
global.document = {
    getElementById: () => ({
        value: 'selectedVersion'
    }),
    cookie: ''
};
global.window = {
    location: {
        origin: 'http://example.com'
    }
};
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ /* mock JSON response */ })
    })
);

// Write the unit tests
test('fetching JSON data for a selected version', async () => {
    // Call the function
    await changeJsonVersion();

    // Assertions
    expect(fetch).toHaveBeenCalledWith('http://example.com/selectedVersion.json');
    expect(initializeSFIAContent).toHaveBeenCalledWith(/* mock JSON data */);
    expect(setupEventListeners).toHaveBeenCalledWith(/* mock JSON data */);
});

test('setting a cookie for the selected version', () => {
    // Call the function
    changeJsonVersion();

    // Assertions
    expect(document.cookie).toBe('selectedVersion=selectedVersion');
});

test('constructing the correct JSON URL', () => {
    // Call the function
    changeJsonVersion();

    // Assertions
    expect(jsonUrl).toBe('http://example.com/selectedVersion.json');
});

test('handling successful JSON response and calling necessary functions', async () => {
    // Mock a successful JSON response
    const mockJSONData = { /* mock JSON data */ };
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJSONData)
        })
    );

    // Call the function
    await changeJsonVersion();

    // Assertions
    expect(initializeSFIAContent).toHaveBeenCalledWith(mockJSONData);
    expect(setupEventListeners).toHaveBeenCalledWith(mockJSONData);
});

test('handling errors during the fetch request', async () => {
    // Mock an error response
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            status: 404
        })
    );

    // Call the function
    await changeJsonVersion();

    // Assertions
    expect(console.error).toHaveBeenCalledWith('There was a problem with the fetch request: Error: HTTP error! Status: 404');
});
