// Import the function to be tested
const { exportHTML } = require('./sfiapdgen_func.js');

// Mock the necessary objects and functions
const mockEvent = {
    preventDefault: jest.fn(),
};
document.getElementById = jest.fn(() => ({ innerHTML: '<p>This is a test</p>' }));
window.location.hash = '#test';
Date.prototype.getDate = jest.fn(() => 25);
Date.prototype.getMonth = jest.fn(() => 11); // Month is zero-based, so December is 11
Date.prototype.getFullYear = jest.fn(() => 2021);
global.encodeURI = jest.fn((value) => value);
document.createElement = jest.fn(() => ({ href: '', download: '', click: jest.fn(), remove: jest.fn() }));

describe('exportHTML function', () => {
    beforeEach(() => {
        // Reset the mocks before each test
        jest.clearAllMocks();
    });

    it('logs the trigger message and event object', () => {
        console.log = jest.fn();
        exportHTML(mockEvent, {});
        expect(console.log).toHaveBeenCalledWith('Export HTML button triggered');
        expect(console.log).toHaveBeenCalledWith('Event:', mockEvent);
    });

    it('prevents the default action associated with the event', () => {
        exportHTML(mockEvent, {});
        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('extracts HTML content from the specified element', () => {
        exportHTML(mockEvent, {});
        expect(document.getElementById).toHaveBeenCalledWith('sfia-output');
    });

    it('processes the URL hash correctly', () => {
        exportHTML(mockEvent, {});
        expect(window.location.hash.replace).toHaveBeenCalledWith('#/', '');
    });

    it('generates the correct filename based on URL values and date', () => {
        exportHTML(mockEvent, {});
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.createElement).toHaveBeenCalledWith('a', { href: 'data:attachment/plain;charset=utf-8,<p>This is a test</p>', download: 'PositionSummary_test_25122021.html' });
    });

    it('truncates the filename if it exceeds 255 characters', () => {
        const longFilename = 'a'.repeat(300);
        window.location.hash = `#${longFilename}`;

        exportHTML(mockEvent, {});
        expect(document.createElement().download).toHaveLength(255);
        expect(window.location.hash.replace).toHaveBeenCalledWith('#/', '');
        expect(window.location.hash.slice).toHaveBeenCalledWith(0, 255 - '_25122021.html'.length);
    });

    it('creates a download link for the HTML file', () => {
        exportHTML(mockEvent, {});
        expect(document.body.appendChild).toHaveBeenCalledWith(document.createElement());
        expect(document.createElement().click).toHaveBeenCalled();
        expect(document.createElement().remove).toHaveBeenCalled();
    });
});
