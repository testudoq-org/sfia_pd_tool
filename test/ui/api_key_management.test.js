const assert = require('assert');

Feature('SFIA Profile Generator');

const TEST_API_KEY = 'Ej7rVt4IhCfOGsZky4GgVIOnqIcI94IxeWnj9ORd';
const SKILL_NAME = 'Acceptance testing';
const SKILL_CODE = 'BPTS';
const SKILL_LEVEL = 2;

Before(async ({ I }) => {
  // Open the page and verify it loads
  I.amOnPage('http://127.0.0.1:5501/package/dev/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator');
});

Scenario('Validate Cohere API key management', async ({ I }) => {
  // Open settings menu
  I.click('#toggle-menu');

  // Wait for menu to open and verify API input exists
  I.waitForElement('#cohere-api');

  // Input API key
  I.fillField('#cohere-api', TEST_API_KEY);

  // Save API key and verify notification
  I.click('#save-keys-btn');
  I.waitForText('API settings saved successfully', 5, '.notification.success');

  // Verify key persists after refresh
  I.refreshPage();
  I.click('#toggle-menu');
  I.waitForElement('#cohere-api');
  I.seeInField('#cohere-api', TEST_API_KEY);
}).tag('@apikey');

Scenario('Manage SFIA Skills with valid API key', async ({ I }) => {
  // Search for BPTS skill
  I.fillField('#myInput', SKILL_CODE);

  // Select skill and verify checkbox
  const skillSelector = `//input[@type='checkbox' and contains(@sfia-data, '"skill":"${SKILL_NAME}","level":${SKILL_LEVEL}')]`;
  I.waitForElement(skillSelector);
  I.click(skillSelector);
  I.seeCheckboxIsChecked(skillSelector);

  // Verify URL hash updates
  I.seeInCurrentUrl(`#${SKILL_CODE}-${SKILL_LEVEL}`);

  // Update and verify editor content
  I.click('button[onclick="updateEditorContent()"]');
  I.waitForElement('#ace-editor');
  I.see(SKILL_NAME, '#ace-editor');

  // Verify editor content
  I.see(SKILL_CODE);
  I.see(SKILL_NAME);

  // Test copy functionality
  I.click('button[onclick="copyToClipboard()"]');
  I.see('Content copied to clipboard', '.notification.success');

  // Start AI conversation and verify button states
  I.click('button[onclick="startConversation()"]');

  // Verify communicating state
  I.see('Communicating...', 'button[onclick="startConversation()"]');
  
}).tag('@skills');
