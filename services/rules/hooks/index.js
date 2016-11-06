const hooks = require('../../../helpers/hookHelpers');
const feathersHooks = require('feathers-hooks-common');
const rulesEngine = require("../../../rulesEngine");


const addToRulesOrder = function(options) {
  return function(hook) {
    hook.app.service('properties').find({query: {key:'rulesOrder'}}).then(rulesOrder => {
      var data = rulesOrder[0].value;
      data.push(hook.result._id);
      hook.app.service('properties').patch(rulesOrder[0]._id, { value:data })
    });
  }
};

const removeFromRulesOrder = function(options) {
  return function(hook) {
    hook.app.service('properties').find({query: {key:'rulesOrder'}}).then(rulesOrder => {
      var data = rulesOrder[0].value;
      const index = data.indexOf(hook.result._id);
      if(index !== -1){
        data.splice(index, 1);
        hook.app.service('properties').patch(rulesOrder[0]._id, { value:data })
      }
    });
  }
};

const reloadRules = function(options) {
  return function(hook) {
    hook.app.rulesEngine.loadRules();
  }
};



exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    hooks.setCreatedAt(),
    hooks.setUpdatedAt()
  ],
  update: [
    hooks.setUpdatedAt()
  ],
  patch: [
    hooks.setUpdatedAt()
  ],
  remove: []
};

exports.after = {
  all: [],
  find: [
    //feathersHooks.remove('code', (hook) => true)
  ],
  get: [],
  create: [
    reloadRules(),
    addToRulesOrder()
  ],
  update: [
    reloadRules()
  ],
  patch: [
    reloadRules()
  ],
  remove: [
    reloadRules(),
    removeFromRulesOrder()
  ]
};
