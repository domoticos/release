const hooks = require('feathers-hooks-common');

const iotdbRestart = function(options) {
  return function(hook) {
    hook.app.iotdbServer.restart();
  }
};




exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [iotdbRestart()],
  remove: []
};
