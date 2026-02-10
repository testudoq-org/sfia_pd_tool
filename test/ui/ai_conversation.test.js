const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
const result = require('dotenv').config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

if (!process.env.TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required. Please add it to your .env file.');
}

Feature('AI Conversation Flow');

const TEST_API_KEY = process.env.TEST_API_KEY;
const SKILL_CODE = 'ITSP';
const SKILL_LEVEL = 4;

Before(async ({ I }) => {
  I.amOnPage('/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator');
});

Scenario('AI conversation returns SFIA Ideas for ITSP-4 on version 9', async ({ I }) => {
  // 1. Save Cohere API key via hamburger menu
  I.click('#toggle-menu');
  I.waitForElement('#cohere-api');
  I.fillField('#cohere-api', TEST_API_KEY);
  I.click('#save-keys-btn');
  I.waitForText('API settings saved successfully', 5, '.notification.success');

  // 2. Select SFIA version 9
  I.selectOption('#jsonVersionSelect', 'version 9');
  I.waitForElement('#sfia-content tr', 10);

  // 3. Check the ITSP level-4 checkbox
  const checkboxSelector = `#sfia-checkbox-${SKILL_CODE}-${SKILL_LEVEL}`;
  I.waitForElement(checkboxSelector, 10);
  I.checkOption(checkboxSelector);
  I.seeCheckboxIsChecked(checkboxSelector);

  // 4. Click "Update Content" and verify editor has ITSP content
  I.click('button[onclick="updateEditorContent()"]');
  I.waitForElement('#ace-editor', 5);
  I.see('Strategic planning', '#ace-editor');

  // 5. Click "Start AI Conversation" and wait for response
  I.click('button[onclick="startConversation()"]');
  I.see('Communicating...', 'button[onclick="startConversation()"]');

  // Wait for the AI response (up to 60 seconds for the API call)
  I.waitForText('SFIA Ideas:', 60, '#ace-editor');

  // 6. Verify the button returns to its normal state
  I.waitForText('Start AI Conversation', 60, 'button[onclick="startConversation()"]');
}).tag('@ai').tag('@conversation');

Scenario('AI conversation shows error when no API key is set', async ({ I }) => {
  // 1. Clear any stored API keys via script execution
  I.executeScript(() => {
    localStorage.removeItem('cohereApiKey');
    localStorage.removeItem('huggingfaceApiKey');
    localStorage.removeItem('selectedApi');
  });
  I.refreshPage();

  // 2. Select SFIA version 9 and check ITSP-4
  I.selectOption('#jsonVersionSelect', 'version 9');
  I.waitForElement('#sfia-content tr', 10);

  const checkboxSelector = `#sfia-checkbox-${SKILL_CODE}-${SKILL_LEVEL}`;
  I.waitForElement(checkboxSelector, 10);
  I.checkOption(checkboxSelector);

  // 3. Click "Update Content"
  I.click('button[onclick="updateEditorContent()"]');
  I.waitForElement('#ace-editor', 5);

  // 4. Click "Start AI Conversation" — should trigger alert
  I.click('button[onclick="startConversation()"]');
  I.acceptPopup();
}).tag('@ai').tag('@error');
