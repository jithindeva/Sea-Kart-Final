const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Wait for React to mount
  await page.waitForTimeout(1000);
  
  // Click the login button in navbar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent.includes('Login'));
    if (loginBtn) loginBtn.click();
  });
  
  // Wait for modal to render
  await page.waitForTimeout(2000);
  
  const html = await page.evaluate(() => document.body.innerHTML);
  const fs = require('fs');
  fs.writeFileSync('dom_dump.html', html);
  await browser.close();
  console.log("DOM saved to dom_dump.html");
})();
