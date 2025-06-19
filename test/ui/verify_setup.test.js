Feature('Verify Setup');

Scenario('basic test', ({ I }) => {
  I.amOnPage('/sfiapdgen.html');
  I.see('SFIA');
});
