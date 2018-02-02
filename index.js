const nodecastor = require('nodecastor');
const util = require('util');
const config = require(`./config.json`);
const localIp = require('./ip.js');

// getting screenshot of grafana dashboard
const grafana = require('./grafana');
const dashboard = config.dashboards[0];
setInterval(() => grafana(dashboard.url, dashboard.login, dashboard.password), config.refreshInterval);

// scan TEA devices
nodecastor.scan()
  .on('online', device => {
    console.log('New device', device.friendlyName);
    if (device.friendlyName === dashboard.device) {
      connect(device);
    }
  })
  .on('offline', device => {
    console.log('Removed device', util.inspect(device));
  })
  .start();

function connect(device) {
  device.on('connect', () => {
    device.on('status', status => {
      console.log('Chromecast status updated', util.inspect(status));
    });

    device.application(config.castAppId, (err, app) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('TEA Cast application', app.id);
      teaCast(app);
    });
  });
}

function teaCast(app) {
  app.join('urn:x-cast:com.google.cast.sample.helloworld', (error, session) => {
    if (error) {
      console.log(error);

      app.run('urn:x-cast:com.google.cast.sample.helloworld', (err, newSession) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Got a session', newSession.id);
        teaSession(newSession);
      });

      return;
    }

    console.log('Joined a session', session.id);
    teaSession(session);
  });
}

function teaSession(session) {
  session.on('message', data => {
    console.log('Got an unexpected message', util.inspect(data));
  });

  setTimeout(() => {
    setInterval(() => sendImage(session, `http://${localIp}:9999/grafana.png`), config.refreshInterval);
  }, 5000);
}

function sendImage(session, url) {
  session.send({ image: url });
}
