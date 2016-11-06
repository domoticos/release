
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'rules.db'),
    autoload: true
  });

  const options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/rules', service(options));

  // Get our initialize service to that we can bind hooks
  const pagesService = app.service('/rules');

  // Set up our before hooks
  pagesService.before(hooks.before);

  // Set up our after hooks
  pagesService.after(hooks.after);
};
