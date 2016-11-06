
const memory = require('feathers-memory');
const hooks = require('./hooks');




module.exports = function() {
  const app = this;

  // Initialize our service with any options it requires
  //app.use('/models', memory({idField:'_id'}));

  const buildModelDataObject = function(moduleName, model, discover, configuration){
    //console.log('model', model)
    return {
      moduleName: moduleName,
      name: model['schema:name'],
      description: model['schema:description'],
      modelId: model['iot:model-id'],
      facet: model['iot:facet'],
      discover: typeof discover !== 'undefined'?discover:true,
      configuration: configuration,
      attributes: model['iot:attribute'].map(function(attr){
        return app.iotdbServer.buildAttribute(attr);
      })
    }
  }

  app.use('/models', {
    find(params) {
      var models = [];
      app.iotdbServer.iotdb.modules().modules().map(function(m, n){
        m.bindings.map(function(b){
          //console.log('b.model', b.model)
          if(b.model){
            models.push(buildModelDataObject(m['module_name'], b.model, b.discover, b.configuration));
          }
          //iotdb.connect(b.model['iot:model-id']);
        });
      });
      return Promise.resolve(models);
    }
  });

  // Get our initialize service to that we can bind hooks
  const modelsService = app.service('/models');

  // Set up our before hooks
  modelsService.before(hooks.before);

  // Set up our after hooks
  modelsService.after(hooks.after);
};
