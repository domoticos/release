
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-memory');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  // Initialize our service with any options it requires
  app.use('/memory', service());

  // Get our initialize service to that we can bind hooks
  const memoryService = app.service('/memory');

  // Set up our before hooks
  memoryService.before(hooks.before);

  // Set up our after hooks
  memoryService.after(hooks.after);
};
