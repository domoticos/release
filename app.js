const path = require('path');
const fs = require('fs');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('./configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');

const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const p2p = require('socket.io-p2p-server').Server;
const middleware = require('./middleware');
const services = require('./services');



const app = feathers();

app.settings.env = process.env.NODE_ENV;


app.configure(configuration());

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon(path.join(app.get('public'), 'favicon.ico')))
  .use('/', serveStatic(app.get('public')))
  .use('/media', serveStatic(path.join(app.get('public'), 'media')))
  .use('/socket', (req, res) => { // allows client to handle e.g. /socket/.../...
    res.sendFile(path.resolve(__dirname, '..', 'public', 'socket.html'));
  })
  .use('/rest', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'rest.html'));
  })
  .use('/verifyReset-client', (req, res) => {
    res.sendFile(path.resolve(
      __dirname, '..', 'node_modules', 'feathers-service-verify-reset', 'lib', 'client.js'
    ));
  })
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  //.configure(socketio(function(io) {io.use(p2p)}))
  .configure(socketio())
  .configure(services)
  .configure(middleware);


  // create default user

  app.service('/users').find().then(users => {
    if(users.length === 0){
      app.service('users').create({email:"admin@domoticos.com", password:"domoticos"});
    }
  });

  // create some properties

  app.service('/properties').find({query: {key:'pagesOrder'}}).then(pagesOrder => {
    if(!pagesOrder[0]){
      app.service('properties').create({key:'pagesOrder', value:[]});
    }
  });
  app.service('/properties').find({query: {key:'rulesOrder'}}).then(rulesOrder => {
    if(!rulesOrder[0]){
      app.service('properties').create({key:'rulesOrder', value:[]});
    }
  });
  app.service('/properties').find({query: {key:'location'}}).then(location => {
    if(!location[0]){
      app.service('properties').create({key:'location', value:{}});
    }
  });
  app.service('/properties').find({query: {key:'time'}}).then(time => {
    if(!time[0]){
      app.service('properties').create({key:'time', value:{}});
    }
  });

  const pkg = require(path.join(app.get('base'), 'package.json'));
  const versionData = {
    version: pkg.version,
    date: pkg.buildDate
  };
  app.service('/memory').find({query: {_id:'version'}}).then(version => {
    if(version[0]){
      app.service('memory').update({query: {_id:'version'}}, {_id:'version', value:versionData});
    } else {
      app.service('memory').create({_id:'version', value:versionData});
    }
  });




module.exports = app;
