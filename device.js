const grafana = require('./grafana');
const teaboard = require('./teaboard');

class Device {

  constructor(chromecast, config) {
    this.chromecast = chromecast;
    this.config = config;
    this.name = this.config.device;
    this.session = null;
    this.scrapHandler = null;
    this.live = false;
  }

  connect(castAppId, castUrn) {
    const device = this;

    this.chromecast.on('connect', () => {
      console.log(`[${device.name}] Connected`);
      this.chromecast.on('status', status => {
        //console.log(`[${device.name}] Status updated`, status);
        const wasLive = device.live;
        device.updateStatus(castAppId, status);

        if (wasLive && !device.live) {
          console.log(`[${device.name}] TEA Cast is not running`);
          device.stop();
        }

        if (chromecastFree(status)) {
          device.start(castAppId, castUrn);
        }
      });

      device.start(castAppId, castUrn);
    });

    this.chromecast.on('disconnect', device.stop.bind(this));
  }

  start(castAppId, castUrn) {
    const device = this;

    launchApp(device, castAppId)
      .then(app => getSession(app, castUrn))
      .then(session => {
        device.session = session;
        device.scrapData();
      })
      .catch(console.log);
  }

  updateStatus(castAppId, status) {
    this.live = teaCastRunning(castAppId, status);
  }

  stop() {
    console.log(`[${this.name}] Disconnected`);
    if (this.scrapHandler) {
      clearInterval(this.scrapHandler);
    }
  }

  scrapData() {
    const device = this;

    // program screenshots
    let scrapper;
    if (this.config.type === 'grafana') {
      scrapper = grafana;
    } else if (this.config.type === 'teaboard') {
      scrapper = teaboard;
    }

    this.scrapHandler = setInterval(
      function scrapAndSend() {
        scrapper(device.config).then(device.displayImage.bind(device));
        return scrapAndSend;
      }(),
      device.config.refreshInterval
    );
  }

  displayImage(url) {
    console.log(`[${this.name}] Display image ${url}`);
    this.session.send({ image: url });
  }
}

function teaCastRunning(castAppId, status) {
  return status.applications && status.applications.some(app => app.appId === castAppId);
}

function chromecastFree(status) {
  return status.applications && status.applications.every(app => app.isIdleScreen);
}

function launchApp(device, castAppId) {
  return new Promise(function(resolve, reject) {
    device.chromecast.application(castAppId, (err, app) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`[${device.name}] Launched TEA Cast application ${app.id}`);
      resolve(app);
    });
  });
}

function getSession(app, castUrn) {
  return new Promise((resolve, reject) => {
    app.join(castUrn, (appNotLaunched, session) => {
      if (appNotLaunched) {
        app.run(castUrn, (error, newSession) => {
          if (error) {
            reject(error);
            return;
          }
          console.log('Got a session', newSession.id);
          resolve(newSession);
        });

        return;
      }

      console.log('Joined a session', session.id);
      resolve(session);
    });
  });
}

module.exports = Device;
