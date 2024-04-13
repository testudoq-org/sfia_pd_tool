// test\unit\sfiapdgen_addSelectionBox_func.test.js
const { addSelectionBox } = require('./sfiapdgen_func.js');

// Mock the checkPreselected function
const checkPreselected = jest.fn(() => false);

test('generate checkbox with correct attributes and checked status when level is present', () => {
    const sfiaJson = {
        "rootKey": {
            "subKey": {
                "skillKey": {
                    "levels": {
                        "1": "Beginner",
                        "2": "Intermediate"
                    },
                    "code": "123"
                }
            }
        }
    };

    const index = 1;
    const rootKey = "rootKey";
    const subKey = "subKey";
    const skillKey = "skillKey";

    const checkbox = addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey);

    // Assert that the checkbox is generated with correct attributes and classes
    expect(checkbox.innerHTML).toContain(`title='${sfiaJson[rootKey][subKey][skillKey]["levels"][index]}'`);
    expect(checkbox.innerHTML).toContain(`sfia-data='{"category":"${rootKey}","subCategory":"${subKey}","skill":"${skillKey}","level":${index}}'`);
    expect(checkbox.innerHTML).toContain("checked");
    expect(checkbox.className).toContain("select_col");
    expect(checkbox.className).toContain("col-checkbox");
});

test('generate disabled checkbox when level is not present', () => {
    const sfiaJson = {
        "rootKey": {
            "subKey": {
                "skillKey": {
                    "levels": {
                        "1": "Beginner",
                        "2": "Intermediate"
                    },
                    "code": "123"
                }
            }
        }
    };

    const index = 3; // Assuming level 3 is not present
    const rootKey = "rootKey";
    const subKey = "subKey";
    const skillKey = "skillKey";

    const checkbox = addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey);

    // Assert that the disabled checkbox is generated with the correct class
    expect(checkbox.innerHTML).toContain("disabled");
    expect(checkbox.className).toContain("no_select_col");
    expect(checkbox.className).toContain("col-checkbox");
});

test('generate checkbox with correct attributes when skill should be preselected', () => {
    const sfiaJson = {
        "rootKey": {
            "subKey": {
                "skillKey": {
                    "levels": {
                        "1": "Beginner",
                        "2": "Intermediate"
                    },
                    "code": "123"
                }
            }
        }
    };

    const index = 1;
    const rootKey = "rootKey";
    const subKey = "subKey";
    const skillKey = "skillKey";

    // Mock checkPreselected to return true
    checkPreselected.mockImplementationOnce(() => true);

    const checkbox = addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey);

    // Assert that the checkbox is generated with the checked attribute
    expect(checkbox.innerHTML).toContain("checked");
});

test('generate checkbox without checked attribute when skill should not be preselected', () => {
    const sfiaJson = {
        "rootKey": {
            "subKey": {
                "skillKey": {
                    "levels": {
                        "1": "Beginner",
                        "2": "Intermediate"
                    },
                    "code": "123"
                }
            }
        }
    };

    const index = 1;
    const rootKey = "rootKey";
    const subKey = "subKey";
    const skillKey = "skillKey";

    // Mock checkPreselected to return false
    checkPreselected.mockImplementationOnce(() => false);

    const checkbox = addSelectionBox(index, sfiaJson, rootKey, subKey, skillKey);

    // Assert that the checkbox is generated without the checked attribute
    expect(checkbox.innerHTML).not.toContain("checked");
});
