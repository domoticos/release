module.exports = {
  setUpdatedAt: function(options) {
    return function(hook) {
      hook.data.updatedAt = new Date();
    }
  },
  setCreatedAt: function(options) {
    return function(hook) {
      hook.data.createdAt = new Date();
    }
  }
}
