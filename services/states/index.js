const hooks = require('./hooks');
module.exports = function() {
  const app = this;

  app.use('/states', {
    create(params) {
      const thing = app.iotdbServer.iotdb.things().with_id(params.thingId);
      if(thing){
        console.log(params.purpose, params.state)
        thing.set(params.purpose, params.state);
      }
      return Promise.resolve({});
    }
  });

  // Get our initialize service to that we can bind hooks
  const statesService = app.service('/states');

  // Set up our before hooks
  statesService.before(hooks.before);

  // Set up our after hooks
  statesService.after(hooks.after);
};
