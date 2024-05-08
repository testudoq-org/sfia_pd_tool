Feature('Check Skill Functionality on URL hash #');

Scenario('Verify adding skill to formatted output', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html#BPTS-2+BPTS-3+BPTS-4');

  // Wait for the URL to change
  I.waitForURL();

  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

  // Verify that the checkbox is checked
  I.seeCheckboxIsChecked("#sfia-checkbox-BPTS-2");
  I.seeCheckboxIsChecked("#sfia-checkbox-BPTS-3");
  I.seeCheckboxIsChecked("#sfia-checkbox-BPTS-4");

  // Verify that the checkbox is unchecked
  I.dontSeeCheckboxIsChecked("#sfia-checkbox-BPTS-5");
  I.dontSeeCheckboxIsChecked("#sfia-checkbox-BPTS-6");
});
