const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');
  
  try {
    await page.click('text="Login"');
    await page.waitForTimeout(1000);
    const html = await page.content();
    if (html.includes('Sign in with Google')) {
      console.log('INNER DIV IS PRESENT!');
    } else {
      console.log('INNER DIV IS MISSING!');
      console.log('HTML DUMP:');
      console.log(html);
    }
  } catch (err) {
    console.error('Error clicking login:', err);
  }
  
  await browser.close();
})();
