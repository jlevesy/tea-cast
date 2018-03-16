const puppeteer = require('puppeteer');
const debug = false;
const outputPath = 'public/screenshots/';

class Scrapper {

  constructor(config, serverPath, scrapListener) {
    this.config = config;
    this.serverPath = serverPath;
    this.scrapListener = scrapListener;
  }

  async start() {
    console.log(`Starting to scrap ${this.config.url}`);

    const browserWSEndpoint = process.env.BROWSER_END_POINT;
    if (browserWSEndpoint) {
      console.log(`Connect to browser at ${browserWSEndpoint}`);
      this.browser = await puppeteer.connect({ browserWSEndpoint });
    } else {
      console.log('Spawning new browser');

      let pptrOptions = { headless: !debug, ignoreHTTPSErrors: true};

      if (process.env.DISABLE_PPTR_SANDBOX) {
        pptrOptions['args'] = ['--no-sandbox', '--disable-setuid-sandbox'];
      }

      this.browser = await puppeteer.launch(pptrOptions);
      process.env.BROWSER_END_POINT = this.browser.wsEndpoint();
    }

    this.page = await this.browser.newPage();
    this.page.setViewport(this.config.viewport);

    await this.navigate();

    this.scrap();
    this.scrapHandler = setInterval(this.scrap.bind(this), this.config.refreshInterval);
  }

  async navigate() {

  }

  async scrap() {
    await this.page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
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

module.exports = Scrapper;
