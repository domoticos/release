const hooks = require('../../../helpers/hookHelpers');

const removeFromAttributes = function(options) {
  return function(hook) {
    hook.app.service('attributes').find({query: {thingId:hook.result._id}}).then(attributes => {
      attributes.map(attribute => {
        hook.app.service('attributes').remove(attribute._id);
      })
    });
  }
};

const disconnectThing = function(options) {
  return function(hook) {
    hook.app.iotdbServer.restart();
    return;
    const thing = hook.app.iotdbServer.iotdb.things().with_id(hook.result._id);
    console.log('disconnect thing', thing.all())
    if(thing.all().length > 0){
      thing.disconnect();
    }
  }
};

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    hooks.setCreatedAt({ as: 'createdAt' }),
    hooks.setUpdatedAt({ as: 'updatedAt' })
  ],
  update: [
    hooks.setUpdatedAt({ as: 'updatedAt' })
  ],
  patch: [
    hooks.setUpdatedAt({ as: 'updatedAt' })
  ],
  remove: []
};


exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [
    removeFromAttributes(),
    disconnectThing()
  ]
};
