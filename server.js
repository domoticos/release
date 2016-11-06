/* eslint no-console: 0 */
const app = require('./app');
const iotdbServer = require('./iotdb');
const bonjour = require('bonjour')({});
const path = require('path');
//const relayClient = require("node-tcp-relay");
const port = app.get('port');
const server = app.listen(port);
const genericHelpers = require('./helpers/generic');
const pkg = require(path.join(app.get('base'), 'package.json'));
console.log(`DomoticOS server v.${pkg.version}`);
app.iotdbServer = iotdbServer(app);

// calculate the sun times
setInterval(function(){
  const date = new Date();
  if(date.getHours() === 0 && date.getMinutes() === 0){
    genericHelpers.calculateSunTimes();
  }
}, 60000);
genericHelpers.calculateSunTimes();

server.on('listening', () => {
  //bonjour.publish({ name: 'domoticOS-web', type: 'http', port: port });
  //relayClient.createRelayClient("localhost", port, "domoticos.com", 2244, 1);
  console.log(`DomoticOS server started on port ${port}`);
  app.iotdbServer.start();
}
);
