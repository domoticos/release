var uuid = require('node-uuid');
const iotdbConnect = function(options) {
  return function(hook) {
    hook.result.uuid = hook.result.thing_id;
    hook.app.iotdbServer.iotdb.connect(hook.result).tag("was-configured");
  }
};

const removeThing = function(options) {
  return function(hook) {
    hook.app.service('things').remove(hook.result._id);
  }
};

const addThingId = function(options) {
  return function(hook) {
    hook.data._id = uuid.v4()+':'+hook.data.model_id;
    hook.data.thing_id = hook.data._id;
  }
}




exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    addThingId()
  ],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [
    iotdbConnect()
  ],
  update: [],
  patch: [],
  remove: [
    removeThing()
  ]
};
