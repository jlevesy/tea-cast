const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'screenshots/';

async function grafana(config) {
  const browser = await puppeteer.launch({ headless: !debug });
  const page = await browser.newPage();
  page.setViewport(config.viewport);

  await page.goto(config.url);
  await page.type('[name="username"]', config.login);
  await page.type('[name="password"]', config.password);
  await page.click('[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${outputPath}/${config.device}.png` });

  await browser.close();

  return outputPath;
}

module.exports = grafana;
