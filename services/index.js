
/* eslint no-console: 0 */

const pages = require('./pages');
const modules = require('./modules');
const properties = require('./properties');
const things = require('./things');
const models = require('./models');
const attributes = require('./attributes');
const authentication = require('./authentication');
const users = require('./user');
const states = require('./states');
const thingsReachable = require('./thingsReachable');
const thingsDefinitions = require('./thingsDefinitions');
const rules = require('./rules');
const memory = require('./memory');

module.exports = function() {
  const app = this;

  app.configure(authentication);
  app.configure(users);
  app.configure(modules);
  app.configure(pages);
  app.configure(models);
  app.configure(states);
  app.configure(properties);
  app.configure(things);
  app.configure(thingsDefinitions);
  app.configure(thingsReachable);
  app.configure(attributes);
  app.configure(rules);
  app.configure(memory);
};
