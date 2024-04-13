const { renderOutput } = require('./sfiapdgen_func.js');

// Mock SFIA JSON data
const sfiaJson = {
  "category1": {
    "subCategory1": {
      "skill1": {
        "description": "Skill 1 description",
        "code": "S1",
        "levels": {
          "1": "Level 1 description",
          "2": "Level 2 description"
        }
      }
    }
  }
};

// Mock checkbox with SFIA data
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = true;
checkbox.setAttribute('sfia-data', JSON.stringify({
  "category": "category1",
  "subCategory": "subCategory1",
  "skill": "skill1",
  "level": "1"
}));

// Mock HTML element for rendering output
const outputElement = document.createElement('div');
outputElement.id = 'sfia-output';
document.body.appendChild(outputElement);

test('renderOutput function test', () => {
  // Run the function to render the output
  renderOutput(sfiaJson, true);

  // Check that the HTML output is rendered as expected
  const expectedOutput = `
  <h1>category1</h1>
  <h2>subCategory1</h2>
  <h3>skill1 - S1</h3>
  <p>Skill 1 description</p>
  <h4>Level 1</h4>
  <p>Level 1 description</p>`;
  expect(outputElement.innerHTML.trim()).toBe(expectedOutput.trim());
});
