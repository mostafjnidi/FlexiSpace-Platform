const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/USER/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
    headless: true
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/FlexiSpace-Platform/support', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/USER/Desktop/support_pw.png', fullPage: true });
  console.log('done');
  await browser.close();
})().catch(e => console.error('ERR:', e.message));
