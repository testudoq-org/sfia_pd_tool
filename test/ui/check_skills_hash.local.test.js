Feature('Check Skill Functionality on URL hash #');

Scenario('Verify adding skill to formatted output', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html#BPTS-2+BPTS-3+BPTS-4');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

  // Verify that the checkbox is checked
  I.seeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":2\')]");
  I.seeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":3\')]");
  I.seeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":4\')]");

  // Verify that the checkbox is unchecked
  I.dontSeeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":5\')]");
  I.dontSeeCheckboxIsChecked("//input[@type='checkbox' and contains(@sfia-data, \'\"skill\":\"Acceptance testing\",\"level\":6\')]");
});
