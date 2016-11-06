
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function () {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'thingsDefinitions.db'),
    autoload: true
  });

  const options = {
    Model: db
  };



  // Initialize our service with any options it requires
  app.use('/thingsDefinitions', service(options));

  // Get our initialize service to that we can bind hooks
  const thingsDefinitions = app.service('/thingsDefinitions');

  // Set up our before hooks
  thingsDefinitions.before(hooks.before);

  // Set up our after hooks
  thingsDefinitions.after(hooks.after);
};
