const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'screenshots/';

async function teaboard(config) {
  const browser = await puppeteer.launch({ headless: !debug });
  const page = await browser.newPage();
  page.setViewport(config.viewport);

  await page.goto(config.url);
  await page.type('[name="_username"]', config.login);
  await page.type('[name="_password"]', config.password);
  await page.click('[type="submit"]');

  await page.waitFor(10000);
  await page.screenshot({ path: `${outputPath}/${config.device}.png` });

  await browser.close();

  return outputPath;
}

module.exports = teaboard;
