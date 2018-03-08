const Scrapper = require('./Scrapper');

class LockRedisScrapper extends Scrapper {

  constructor(config, serverPath, scrapListener) {
    super(config, serverPath, scrapListener);
  }

  async navigate() {
    await this.page.goto(this.config.url);
    await this.page.type('[name="_username"]', this.config.login);
    await this.page.type('[name="_password"]', this.config.password);
    await this.page.click('[type="submit"]');

    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
  }
}

module.exports = LockRedisScrapper;
