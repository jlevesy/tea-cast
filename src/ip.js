const os = require('os');

const en0 = os.networkInterfaces()['en0'];

module.exports = en0.filter(int => int.family === 'IPv4').map(int => int.address);