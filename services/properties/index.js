
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function () {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'properties.db'),
    autoload: true,
  });

  const options = {
    Model: db
  };




  // Initialize our service with any options it requires
  app.use('/properties', service(options));

  // Get our initialize service to that we can bind hooks
  const propertiesService = app.service('/properties');

  // Set up our before hooks
  propertiesService.before(hooks.before);

  // Set up our after hooks
  propertiesService.after(hooks.after);
};
