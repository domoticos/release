
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');
const iotdbModules = require('./initModules');

module.exports = function() {
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'modules.db'),
    autoload: true,
  });




  db.find({},function (err, modulesInCollection) {
    iotdbModules.map(function(moduleData, index){
      var moduleInCollection = null;
      for(var i=0; i<modulesInCollection.length; i++){
        if(modulesInCollection[i].name == moduleData.name){
          moduleInCollection = modulesInCollection[i];
        }
      }

      if(moduleInCollection){
        for(var i=0; i<moduleInCollection.settingFields.length; i++){
          if(moduleInCollection.settingFields[i].value){
            moduleData.settingFields[i].value = moduleInCollection.settingFields[i].value;
          }
        }
        moduleData.enabled = moduleInCollection.enabled;
        db.update({_id: moduleInCollection._id}, moduleData);
      } else {
        db.insert(moduleData);
      }
    });
  })

  const options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/modules', service(options));

  // Get our initialize service to that we can bind hooks
  const modulesService = app.service('/modules');

  // Set up our before hooks
  modulesService.before(hooks.before);

  // Set up our after hooks
  modulesService.after(hooks.after);

};
