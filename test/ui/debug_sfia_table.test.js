Feature('Debug SFIA Table Loading');

Scenario('Check if SFIA table has content', async ({ I }) => {
  // Open the page
  I.amOnPage('/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator');
  
  // Wait a bit for the content to load
  I.wait(3);
  
  // Check if the SFIA content table exists
  I.seeElement('#sfia-content');
  
  // Check if there are any table rows in the SFIA content
  I.seeElement('#sfia-content tr');
  
  // Check if there are any checkboxes with id starting with "sfia-checkbox"
  I.seeElement('input[type="checkbox"][id^="sfia-checkbox"]');
  
  // Count how many checkboxes exist
  const checkboxCount = await I.grabNumberOfVisibleElements('input[type="checkbox"][id^="sfia-checkbox"]');
  console.log(`Found ${checkboxCount} SFIA checkboxes`);
  
  // Check if there are any skill_key elements (skill names)
  I.seeElement('.skill_key');
  
  // Count how many skills exist
  const skillCount = await I.grabNumberOfVisibleElements('.skill_key');
  console.log(`Found ${skillCount} SFIA skills`);
  
  // Try to find any checkbox and log its attributes
  const firstCheckbox = await I.grabAttributeFrom('input[type="checkbox"][id^="sfia-checkbox"]', 'id');
  console.log(`First checkbox ID: ${firstCheckbox}`);
  
  // Try to find any checkbox with sfia-data attribute
  const hasDataAttribute = await I.grabNumberOfVisibleElements('input[type="checkbox"][sfia-data]');
  console.log(`Checkboxes with sfia-data attribute: ${hasDataAttribute}`);
});