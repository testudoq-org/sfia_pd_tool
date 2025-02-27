Feature('Check Combined SFIA and LoR URL Hash Functionality');

Scenario('Verify SFIA skills with LoR in URL hash', async ({ I }) => {
  // Open the page with combined SFIA and LoR hash
  I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html#BPTS-4+BSMO-4&&AUTO-4+INFL-4');
  
  // Wait for the URL to change
  I.waitForURL();

  I.seeInTitle('SFIA POSITION DESCRIPTION Generator');

  // Verify SFIA checkboxes are checked
  I.seeCheckboxIsChecked("#sfia-checkbox-BPTS-4");
  I.seeCheckboxIsChecked("#sfia-checkbox-BSMO-4");
  
  // Verify SFIA content is displayed @bug this is undefined bug - should not say undefined should provide description
  I.see('Acceptance testing - undefined', '#sfia-output');
  I.see('Business modelling - undefined', '#sfia-output');

  // Verify LoR checkboxes are checked
  I.seeCheckboxIsChecked("#lor-checkbox-0-Autonomy-4");
  I.seeCheckboxIsChecked("#lor-checkbox-1-Influence-4");

  // Verify LoR content is displayed
  I.see('Works under general direction', '.lor-description');
  I.see('Makes decisions which influence the success of projects and team objectives.', '.lor-description');
});

Scenario('Verify only SFIA skills in URL hash', async ({ I }) => {
  // Open the page with only SFIA hash
  I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html#BPTS-4+BSMO-4');
  
  I.waitForURL();

  // Verify SFIA checkboxes are checked
  I.seeCheckboxIsChecked("#sfia-checkbox-BPTS-4");
  I.seeCheckboxIsChecked("#sfia-checkbox-BSMO-4");
  
  // Verify SFIA content is displayed @bug this is undefined bug - should not say undefined should provide description
  I.see('Acceptance testing - undefined', '#sfia-output');
  I.see('Business modelling - undefined', '#sfia-output');
});

Scenario('Verify only LoR in URL hash', async ({ I }) => {
  // Open the page with only LoR hash (note the leading &&)
  I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html#&&AUTO-4+INFL-4');
  
  I.waitForURL();

  // Verify LoR checkboxes are checked
  I.seeCheckboxIsChecked("#lor-checkbox-0-Autonomy-4");
  I.seeCheckboxIsChecked("#lor-checkbox-1-Influence-4");

  // Verify LoR content is displayed
  I.see('Works under general direction', '.lor-description');
  I.see('Makes decisions which influence the success of projects and team objectives.', '.lor-description');
});
