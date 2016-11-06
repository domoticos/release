const hooks = require('../../../helpers/hookHelpers');

const addToPagesOrder = function(options) {
  return function(hook) {
    hook.app.service('properties').find({query: {key:'pagesOrder'}}).then(pagesOrder => {
      var data = pagesOrder[0].value;
      data.push(hook.result._id);
      hook.app.service('properties').patch(pagesOrder[0]._id, { value:data })
    });
  }
};

const removeFromPagesOrder = function(options) {
  return function(hook) {
    hook.app.service('properties').find({query: {key:'pagesOrder'}}).then(pagesOrder => {
      var data = pagesOrder[0].value;
      const index = data.indexOf(hook.result._id);
      if(index != -1){
        data.splice(index, 1);
        hook.app.service('properties').patch(pagesOrder[0]._id, { value:data })
      }
    });
  }
};

const addContent = function(options) {
  return function(hook) {
    hook.data.content = [];
  }
};




exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    hooks.setCreatedAt(),
    hooks.setUpdatedAt(),
    addContent()
  ],
  update: [
    hooks.setUpdatedAt()
  ],
  patch: [
    hooks.setUpdatedAt()
  ],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [
    addToPagesOrder()
  ],
  update: [],
  patch: [],
  remove: [
    removeFromPagesOrder()
  ],
};
