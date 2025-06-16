Feature('Verify Setup');

Scenario('basic test', ({ I }) => {
  I.amOnPage('http://127.0.0.1:5501/sfiapdgen.html');
  I.see('SFIA');
});
