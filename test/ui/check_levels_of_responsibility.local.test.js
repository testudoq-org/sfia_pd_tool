Feature('Levels of Responsibility Functionality');

Scenario('Verify Levels of Responsibility display and selection', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

  // Verify that Levels of Responsibility table is displayed
  I.seeElement('.levels-of-responsibility');
  I.seeElement('.sfia-lors-table');

  // Verify that Levels of Responsibility data is displayed
  const levelsData = [
    { level: '1', autonomy: 'Works under close direction.', influence: 'Minimal influence.', complexity: 'Performs routine activities in a structured environment.' },
    // Add more level data here...
  ];

  levelsData.forEach((level, index) => {
    I.see(`//table[@class='sfia-lors-table']/tbody/tr[${index + 1}]/td[1]`, level.level);
    I.see(`//table[@class='sfia-lors-table']/tbody/tr[${index + 1}]/td[2]`, level.autonomy);
    I.see(`//table[@class='sfia-lors-table']/tbody/tr[${index + 1}]/td[3]`, level.influence);
    I.see(`//table[@class='sfia-lors-table']/tbody/tr[${index + 1}]/td[4]`, level.complexity);
    // Add more assertions for other columns as needed
  });

  // Select a specific level (e.g., level 3)
  const selectedLevel = '3';
  I.click(`//table[@class='sfia-lors-table']/tbody/tr[${levelsData.findIndex(level => level.level === selectedLevel) + 1}]/td/input`);

  // Verify that the selected level checkbox is checked
  I.seeCheckboxIsChecked(`//table[@class='sfia-lors-table']/tbody/tr[${levelsData.findIndex(level => level.level === selectedLevel) + 1}]/td/input`);

  // Verify that the selected level is included in the formatted output
  I.seeInElement('#sfia-output', `Level of Responsibility: ${selectedLevel}`);
});
