const hooks = require('../../../helpers/hookHelpers');
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
  remove: []
};
