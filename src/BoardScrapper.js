const Scrapper = require('./Scrapper');

const TIMEOUT = 120000;

class BoardScrapper extends Scrapper {
  constructor(config, serverPath, scrapListener) {
    super(config, serverPath, scrapListener);
  }

  async navigate() {
    await this.page.goto(this.config.url);
    await this.page.type('[name="_username"]', this.config.login);
    await this.page.type('[name="_password"]', this.config.password);
    await this.page.click('[type="submit"]');

    await this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    await this.page.waitForFunction(() => document.querySelectorAll('.loading').length <= 1, {
      polling: 500,
      timeout: TIMEOUT
    });
  }
}

module.exports = BoardScrapper;
