const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'public/screenshots/';

class GrafanaScrapper {

  constructor(config, serverPath, scrapListener) {
    this.config = config;
    this.serverPath = serverPath;
    this.scrapListener = scrapListener;
  }

  async start() {
    //console.log(`Starting to scrap ${this.config.url}`);

    this.browser = await puppeteer.launch({ headless: !debug, ignoreHTTPSErrors: true });
    this.page = await this.browser.newPage();
    this.page.setViewport(this.config.viewport);

    await this.page.goto(this.config.url);
    await this.page.type('[name="username"]', this.config.login);
    await this.page.type('[name="password"]', this.config.password);
    await this.page.click('[type="submit"]');

    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    await this.page.type('body', 'd');
    await this.page.type('body', 'k');

    this.scrap();
    this.scrapHandler = setInterval(this.scrap.bind(this), this.config.refreshInterval);
  }

  scrap() {
    return this.page
      .screenshot({ path: `${outputPath}/${this.config.device}.png` })
      .then(() => this.scrapListener(`${this.serverPath}/${this.config.device}.png?time=${Date.now()}`));
  }

  stop() {
    if (this.scrapHandler) {
      clearInterval(this.scrapHandler);
      this.scrapHandler = null;
    }
    return this.browser.close();
  }
}

module.exports = GrafanaScrapper;
