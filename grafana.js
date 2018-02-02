const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'screenshots/grafana.png';

async function grafana(url, login, password) {
  const browser = await puppeteer.launch({ headless: !debug });
  const page = await browser.newPage();
  page.setViewport({
    width: 1280,
    height: 720
  });

  await page.goto(url);
  await page.type('[name="username"]', login);
  await page.type('[name="password"]', password);
  await page.click('[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath });

  await browser.close();

  return outputPath;
}

module.exports = grafana;
