
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'attributes.db'),
    autoload: true
  });

  const options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/attributes', service(options));

  // Get our initialize service to that we can bind hooks
  const attributeService = app.service('/attributes');

  // Set up our before hooks
  attributeService.before(hooks.before);

  // Set up our after hooks
  attributeService.after(hooks.after);
};
