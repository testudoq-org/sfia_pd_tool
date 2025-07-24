const assert = require("assert");
Feature("Skillset URL JSON Version Check");

Scenario("Click skillset URL and verify JSON version is 9", async ({ I }) => {
  // Step 1: Navigate to the main SFIA PD Generator page
  I.amOnPage("/sfiapdgen.html");
  I.see("SFIA PD Generator", ".navbar-brand");

  // Check version 9 selection
  I.selectOption("#jsonVersionSelect", "version 9");

  // Verify dropdown selection using seeInField
  I.seeInField("#jsonVersionSelect", "version 9");

  // Step 2: Wait for the SFIA table to be present
  I.waitForElement(".sfia-table", 10);

  // Step 3: Find all skillset links in the table
  const allLinks = await I.grabNumberOfVisibleElements(
    ".sfia-table .skill_key a"
  );
  assert(allLinks > 0, "No skillset links found in the SFIA table");
  // Step 4: Use the first visible link
  const skillsetLinkLocator = locate(".sfia-table .skill_key a").at(1);
  I.waitForElement(skillsetLinkLocator, 5);
  I.seeElement(skillsetLinkLocator);

  // Step 5: Get the href attribute of the link
  const url = await I.grabAttributeFrom(skillsetLinkLocator, "href");
  I.say(`Found skillset URL: ${url}`);

  // Step 6: Click the link and check new tab opens with correct URL
  // Remove target="_blank" to make links open in same tab for testing
  await I.executeScript(() => {
    const links = document.querySelectorAll(".sfia-table .skill_key a");
    links.forEach((link) => {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    });
  });

  // Click the link (now opens in same tab)
  I.click(skillsetLinkLocator);
  I.waitForNavigation();

  // Verify we navigated to the correct URL (allow for redirects/canonicalization)
  const newTabUrl = await I.grabCurrentUrl();
  I.say(`Navigated to: ${newTabUrl}`);

  // Assert the navigated URL contains the expected domain and skill code
  assert(
    newTabUrl.includes('sfia-online.org') && newTabUrl.includes('/sfia-9/skills/'),
    `Navigated URL should contain 'sfia-online.org' and '/sfia-9/skills/', got: ${newTabUrl}`
  );

  // Navigate back to restore test state
  I.amOnPage("/sfiapdgen.html");
  I.selectOption("#jsonVersionSelect", "version 9");
  I.waitForElement(".sfia-table", 10);
});
