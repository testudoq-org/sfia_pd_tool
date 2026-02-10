const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Install init script to observe SFIA table mutations and body marker changes
  await page.addInitScript(() => {
    window.__sfiaObserverEvents = [];
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        try {
          if (m.type === 'attributes' && m.attributeName === 'data-sfia-loaded') {
            console.log('[INIT OBSERVER] body data-sfia-loaded changed to:', document.body.getAttribute('data-sfia-loaded'));
            window.__sfiaObserverEvents.push({ type: 'dataMarker', value: document.body.getAttribute('data-sfia-loaded') });
          }
          if (m.type === 'childList' && m.target && m.target.id === 'sfia-content') {
            console.log('[INIT OBSERVER] sfia-content changed; children:', m.target.children.length);
            window.__sfiaObserverEvents.push({ type: 'sfiaChildList', children: m.target.children.length });
          }
        } catch (e) {
          console.warn('[INIT OBSERVER] error', e && e.message);
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-sfia-loaded'] });
    const sfia = document.getElementById('sfia-content');
    if (sfia) observer.observe(sfia, { childList: true });
    // Also poll to add observer to sfia-content when it appears
    const poll = setInterval(() => {
      const s = document.getElementById('sfia-content');
      if (s && !s.__observing) {
        s.__observing = true;
        observer.observe(s, { childList: true });
        console.log('[INIT OBSERVER] attached to sfia-content');
      }
    }, 100);
  });

  await page.goto('http://localhost:5502/src/sfiapdgen.html', { waitUntil: 'networkidle' });

  page.on('console', msg => {
    console.log('[PAGE CONSOLE]', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err && err.message ? err.message : err);
  });

  try {
    // Wait for the data-loaded marker (20s)
    await page.waitForSelector('body[data-sfia-loaded="true"]', { timeout: 20000 });
    console.log('data marker found');
  } catch (e) {
    console.warn('data marker NOT found');
  }

  const tableExists = await page.$('#sfia-content');
  if (!tableExists) {
    console.log('#sfia-content NOT found');
    await browser.close();
    process.exit(2);
  }

  const rows = await page.$$eval('#sfia-content tr', trs => trs.length);
  console.log('sfia row count:', rows);

  const inner = await page.$eval('#sfia-content', el => el.innerText.slice(0, 1000));
  console.log('sfia content (truncated):');
  console.log(inner);

  // Check for SUST
  const hasSUST = await page.$$eval('.sfia-table td', tds => tds.some(td => td && td.innerText && td.innerText.includes('SUST')));
  console.log('contains SUST?', hasSUST);

  // Import constants module in page and check sfiaJson
  try {
    const info = await page.evaluate(async () => {
      try {
        const mod = await import('/src/modules/constants.mjs');
        return { sfiaDefined: typeof mod.sfiaJson !== 'undefined', sfiaKeys: mod.sfiaJson ? Object.keys(mod.sfiaJson).length : null };
      } catch (e) {
        return { error: e && e.message ? e.message : String(e) };
      }
    });
    console.log('constants.mjs info:', info);
  } catch (e) {
    console.error('Error importing constants in page:', e && e.message ? e.message : e);
  }

  // Try forcing initializeSFIAContent with the current constants.sfiaJson
  try {
    const newRowCount = await page.evaluate(async () => {
      const init = await import('/src/modules/initializeContent.mjs');
      const constants = await import('/src/modules/constants.mjs');
      await init.initializeSFIAContent(constants.sfiaJson);
      return document.querySelectorAll('#sfia-content tr').length;
    });
    console.log('Row count after forcing initializeSFIAContent:', newRowCount);
  } catch (err) {
    console.error('Error invoking initializeSFIAContent in page:', err && err.message ? err.message : err);
  }

  await browser.close();
})();