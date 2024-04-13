// Import the function to be tested
const { exportCSV } = require('./sfiapdgen_func.js');

// Mock the necessary objects and functions
global.encodeURI = jest.fn((value) => value);

const mockEvent = {
    preventDefault: jest.fn(),
};

describe('exportCSV', () => {
    beforeEach(() => {
        // Reset the mocks before each test
        jest.clearAllMocks();
    });

    test('should not create CSV file when no checkboxes are checked', () => {
        // Setup
        document.querySelectorAll = jest.fn(() => []);
        const mockSfiaJson = {};

        // Execute
        exportCSV(mockEvent, mockSfiaJson);

        // Verify
        expect(console.log).toHaveBeenCalledWith('Export CSV triggered');
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(document.createElement).not.toHaveBeenCalled();
    });

    test('should create CSV file when checkboxes with complete data are checked', () => {
        // Setup
        const mockCheckedBox = {
            getAttribute: () => JSON.stringify({ category: 'category', subCategory: 'subCategory', skill: 'skill', level: 'level' })
        };
        document.querySelectorAll = jest.fn(() => [mockCheckedBox]);
        const mockSfiaJson = {
            category: {
                subCategory: {
                    skill: {
                        code: '123',
                        description: 'Example description',
                        levels: {
                            level: 'Expert'
                        }
                    }
                }
            }
        };

        // Execute
        exportCSV(mockEvent, mockSfiaJson);

        // Verify
        expect(console.log).toHaveBeenCalledWith('Export CSV triggered');
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.createElement().href).toBe('data:attachment/csv,category,subCategory,skill,level');
    });

    test('should log errors when checkboxes with incomplete data are checked', () => {
        // Setup
        const mockCheckedBox = {
            getAttribute: () => JSON.stringify({ category: 'category', subCategory: 'subCategory', skill: 'skill', level: 'level' })
        };
        document.querySelectorAll = jest.fn(() => [mockCheckedBox]);
        const mockSfiaJson = {
            category: {
                subCategory: {
                    skill: {
                        code: '123',
                        description: 'Example description',
                        levels: {}
                    }
                }
            }
        };
        console.error = jest.fn();

        // Execute
        exportCSV(mockEvent, mockSfiaJson);

        // Verify
        expect(console.log).toHaveBeenCalledWith('Export CSV triggered');
        expect(console.error).toHaveBeenCalledWith('Incomplete or missing data for category/subCategory/skill');
    });

    test('should create download link for the CSV file', () => {
        // Setup
        const mockCheckedBox = {
            getAttribute: () => JSON.stringify({ category: 'category', subCategory: 'subCategory', skill: 'skill', level: 'level' })
        };
        document.querySelectorAll = jest.fn(() => [mockCheckedBox]);
        const mockSfiaJson = {
            category: {
                subCategory: {
                    skill: {
                        code: '123',
                        description: 'Example description',
                        levels: {
                            level: 'Expert'
                        }
                    }
                }
            }
        };

        // Execute
        exportCSV(mockEvent, mockSfiaJson);

        // Verify
        expect(console.log).toHaveBeenCalledWith('Export CSV triggered');
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.createElement().href).toBe('data:attachment/csv,category,subCategory,skill,level');
        expect(document.body.appendChild).toHaveBeenCalledWith(document.createElement());
        expect(a.click).toHaveBeenCalled();
        expect(a.remove).toHaveBeenCalled();
    });

    test('should handle multiple checked checkboxes with different data', () => {
        // Setup
        const mockCheckedBoxes = [
            {
                getAttribute: () => JSON.stringify({ category: 'category1', subCategory: 'subCategory1', skill: 'skill1', level: 'level1' })
            },
            {
                getAttribute: () => JSON.stringify({ category: 'category2', subCategory: 'subCategory2', skill: 'skill2', level: 'level2' })
            }
        ];
        document.querySelectorAll = jest.fn(() => mockCheckedBoxes);
        const mockSfiaJson = {
            category1: {
                subCategory1: {
                    skill1: {
                        code: '123',
                        description: 'Description 1',
                        levels: {
                            level1: 'Level 1'
                        }
                    }
                }
            },
            category2: {
                subCategory2: {
                    skill2: {
                        code: '456',
                        description: 'Description 2',
                        levels: {
                            level2: 'Level 2'
                        }
                    }
                }
            }
        };

        // Execute
        exportCSV(mockEvent, mockSfiaJson);

        // Verify
        expect(console.log).toHaveBeenCalledWith('Export CSV triggered');
        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.createElement().href).toBe('data:attachment/csv,"category1,subCategory1,skill1,level1","Description 1","Level 1"\n"category2,subCategory2,skill2,level2","Description 2","Level 2"');
    });
});
