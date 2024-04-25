Feature('Add Skill Functionality');

Scenario('Verify adding skill to formatted output', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

  // Search for the skill "BPTS Level 2"
  const searchQuery = 'BPTS';
  I.fillField('#myInput', searchQuery);

  // Click on the skill "Acceptance testing" with level 2
  I.click("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]");

  // Verify that the checkbox is checked
  I.seeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]");

  // Click on the skill "Acceptance testing" with level 2
  I.click("//input[@type='checkbox' and contains(@sfia-data, '\"skill\":\"Acceptance testing\",\"level\":2')]")

  // Verify that the checkbox is unchecked
  I.dontSeeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]");
});
