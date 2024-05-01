Scenario('Verify Levels of Responsibility display and selection', async ({ I }) => {
  // Open the page
  I.amOnPage('http://127.0.0.1:5500/src/sfiapdgen.html');
  I.seeInTitle('SFIA POSITION DESCRIPTION Generator'); // Add this line for the title assertion

    // Verify that the New section for Levels of Responsibility is present
    I.seeElement('.levels-of-responsibility');

     // Verify that the Levels of Responsibility data is displayed
     const levelsData = [
      { responsibility: 'Autonomy', level: '1', description: 'Works under close direction. Uses little discretion in attending to enquiries. Is expected to seek guidance in unexpected situations.' },
      { responsibility: 'Influence', level: '2', description: 'Interacts with and may influence immediate colleagues. May have some external contact with customers, suppliers and partners. Aware of need to collaborate with team and represent users/customer needs.' },
      { responsibility: 'Complexity', level: '3', description: 'Performs routine activities in a structured environment. Requires assistance in resolving unexpected problems. Participates in the generation of new ideas.' },
      { responsibility: 'Business skills', level: '4', description: 'Has sufficient oral and written communication skills for effective engagement with immediate colleagues.\nUses basic systems and tools, applications and processes.\nDemonstrates an organised approach to work. Has basic digital skills to learn and use applications and tools for their role.\nLearning and professional development —  contributes to identifying own development opportunities.\nSecurity, privacy and ethics — understands and complies with organisational standards.' },
      { responsibility: 'Knowledge', level: '5', description: 'Has gained a basic domain knowledge. Demonstrates application of essential generic knowledge typically found in industry bodies of knowledge. Absorbs new information when it is presented systematically and applies it effectively.' },
      // Add more level data here...
    ];

    // Verify that the table data is correct
      I.seeElement("//td[contains(text(),'Autonomy')]");
      I.seeElement("//td[contains(text(),'Influence')]");
      I.seeElement("//td[contains(text(),'Complexity')]");
      I.seeElement("//td[contains(text(),'Business skills')]");
      I.seeElement("//td[contains(text(),'Knowledge')]");


  // Verify that the Levels of Responsibility table is displayed
  I.seeElement('.sfia-lors-table');

  // Verify that the table has the correct number of rows
  I.seeNumberOfVisibleElements('.sfia-lors-table tbody tr', levelsData.length);

  // Verify that the table headers are correct
  I.seeElement('.sfia-lors-table thead th', 'Responsibility, Level 1, Level 2, Level 3, Level 4, Level 5, Level 6, Level 7');

  // Select a specific level (e.g., level 2)
  const selectedLevel = '2';
  I.click(`//table[@class='sfia-lors-table']/tbody/tr[${levelsData.findIndex(level => level.level === selectedLevel) + 1}]/td/input`);

  // Verify that the selected level checkbox is checked
  I.seeCheckboxIsChecked(`//table[@class='sfia-lors-table']/tbody/tr[${levelsData.findIndex(level => level.level === selectedLevel) + 1}]/td/input`);

  // Verify that the formatted output is displayed
  I.seeElement('#lor-output', `Complexity`);
  I.seeElement('#lor-output', `${selectedLevel}`);

});
