const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'public/screenshots/';

const localIp = require('./ip.js');
const serverPath = `http://${localIp}:9999/screenshots`;

const TIMEOUT = 120000;

async function teaboard(config) {
  const browser = await puppeteer.launch({ headless: !debug, ignoreHTTPSErrors: true });
  const page = await browser.newPage();
  page.setViewport(config.viewport);

  await page.goto(config.url);
  await page.type('[name="_username"]', config.login);
  await page.type('[name="_password"]', config.password);
  await page.click('[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForFunction(() => document.querySelectorAll('.loading').length <= 1, { polling: 500, timeout: TIMEOUT });
  await page.screenshot({ path: `${outputPath}/${config.device}.png` });

  await browser.close();

  return `${serverPath}/${config.device}.png?time=${Date.now()}`;
}

module.exports = teaboard;
