const nodecastor = require('nodecastor');
const util = require('util');
const config = require(`./config.tea.json`);
const localIp = require('./ip.js');

// getting screenshot of grafana dashboard
const grafana = require('./grafana');
const dashboards = config.dashboards;

// scan TEA devices
nodecastor.scan()
  .on('online', device => {
    console.log('New device', device.friendlyName);
    const connectedDeviceDashboard = dashboards.filter(dashboard => dashboard.device === device.friendlyName);
    if (connectedDeviceDashboard.length > 0) {
      connect(device, connectedDeviceDashboard[0]);
    }
  })
  .on('offline', device => {
    console.log('Removed device', util.inspect(device));
  })
  .start();

function connect(device, dashboard) {
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
      teaCast(app, dashboard);
      setInterval(() => grafana(dashboard), config.refreshInterval);
    });
  });
}

function teaCast(app, dashboard) {
  app.join('urn:x-cast:urn:x-cast:com.tea.cast.monitoring', (error, session) => {
    if (error) {
      console.log(error);

      app.run('urn:x-cast:urn:x-cast:com.tea.cast.monitoring', (err, newSession) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Got a session', newSession.id);
        teaSession(newSession, dashboard);
      });

      return;
    }

    console.log('Joined a session', session.id);
    teaSession(session, dashboard);
  });
}

function teaSession(session, dashboard) {
  session.on('message', data => {
    console.log('Got an unexpected message', util.inspect(data));
  });

  setTimeout(() => {
    setInterval(() => sendImage(session, `http://${localIp}:9999/${dashboard.device}.png`), config.refreshInterval);
  }, 5000);
}

function sendImage(session, url) {
  session.send({ image: url });
}
