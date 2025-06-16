Feature('Instructions Functionality');

Scenario('Verify instructions toggle behavior', async ({ I }) => {
  // Navigate to page
  I.amOnPage('http://127.0.0.1:5501/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion
  
  // Wait for toggle button
  const toggleButton = 'button[data-bs-toggle="collapse"][data-bs-target="#instructions"]';
  const toggleInstructions= '.card-body.collapsed.collapse.show#instructions';
  const toggleInstructionsCollapsed= '.card-body.collapsed.collapse';
  I.waitForElement(toggleButton, 10);
  
  // Verify initial collapsed state
  I.dontSeeElement('.card-body.collapsed.collapse.show#instructions');

  // Click to expand instructions
  I.click(toggleButton);
  I.waitForElement(toggleInstructions, 10); // Wait longer for animation and attribute update
  I.seeElement(toggleInstructions);
  
  // After expanding - wait and verify expanded state
  // Click to collapse instructions
  I.click(toggleButton);
  I.waitForElement(toggleInstructionsCollapsed, 10); // Wait longer for animation and attribute update
  I.dontSeeElement(toggleInstructions);
  

}).retry(2);
