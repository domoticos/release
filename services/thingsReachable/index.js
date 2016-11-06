
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function () {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'things_reachable.db'),
    autoload: true
  });

  const options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/thingsReachable', service(options));

  // Get our initialize service to that we can bind hooks
  const thingsReachableService = app.service('/thingsReachable');

  // Set up our before hooks
  thingsReachableService.before(hooks.before);

  // Set up our after hooks
  thingsReachableService.after(hooks.after);
};
