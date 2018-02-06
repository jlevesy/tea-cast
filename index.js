const nodecastor = require('nodecastor');
const config = require(`./config.tea.json`);
const Device = require('./device.js');

const devices = [];
const scanner = nodecastor.scan();

scanner.on('online', chromecast => {
  console.log(`Detected chromecast ${chromecast.friendlyName}`);
  const connectedChromecastDashboard = config.dashboards.filter(dashboard => dashboard.device === chromecast.friendlyName);
  if (connectedChromecastDashboard.length > 0) {
    const device = new Device(chromecast, connectedChromecastDashboard[0]);
    devices.push(device);
    device.connect(config.castAppId);
  }
});

scanner.on('offline', chromecast => console.log(`Removed chromecast ${chromecast.friendlyName}`));

// scan chromecast devices
scanner.start();
