const Scrapper = require('./Scrapper');

class GrafanaScrapper extends Scrapper {

  constructor(config, serverPath, scrapListener) {
    super(config, serverPath, scrapListener);
  }

  async navigate() {
    await this.page.goto(this.config.url);

    const onLoginPage = await this.page.$('[name="username"]');
    if (onLoginPage) {
      await this.page.type('[name="username"]', this.config.login);
      await this.page.type('[name="password"]', this.config.password);
      await this.page.click('[type="submit"]');

      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    }


    await this.page.type('body', 'd');
    await this.page.type('body', 'k');
  }

  scrap() {
    return this.page
      .screenshot({ path: `${this.outputPath}/${this.config.device}.png` })
      .then(() => this.scrapListener(`${this.serverPath}/${this.config.device}.png?time=${Date.now()}`));
  }
}

module.exports = GrafanaScrapper;
