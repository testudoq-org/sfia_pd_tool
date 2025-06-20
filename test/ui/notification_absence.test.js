Feature('Notification Absence');

Scenario('Notification error message is not displayed on initial load', ({ I }) => {
  I.amOnPage('/sfiapdgen.html');
  I.dontSee('Application initialization failed. Please refresh the page.', '#notification-container');
});

Scenario('Notification error message is not displayed after reload', ({ I }) => {
  I.amOnPage('/sfiapdgen.html');
  I.refreshPage();
  I.dontSee('Application initialization failed. Please refresh the page.', '#notification-container');
});