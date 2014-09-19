var _ = require('underscore');
var assert = require('assert');

module.exports = function (parent) {
  return parent.extend({
    ERROR_NAME: 'backbone-node-client',
    error: function (message) {
      var err = new Error(message);
      err.name = this.ERROR_NAME;
      err.status = 500;
      err.details = this.toJSON();
      return err;
    },

    adjustOptions: function (options, cb) {
      var that = this;

      if (options && _.isFunction(options.error) && _.isFunction(options.success)) {
        return options;
      }

      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }

      assert.equal(typeof cb, 'function');

      function invalid (model, err) {
        cb(err, model);
      }

      this.once('invalid', invalid);

      options.success = function (model, resp) {
        that.off('invalid', invalid);
        cb(null, model, resp);
      };

      options.error = function (model, err) {
        that.off('invalid', invalid);
        cb(err, model);
      };

      return options;
    },

    // implement custom sync function
    request: function (method, params) {
      /**
       * backbone method: create|update|patch|read|delete
       * map to the actually http method accordingly
       */
      assert(method);
      assert(params.url);
      assert.equal(typeof params.error, 'function');
      assert.equal(typeof params.success, 'function');

      return params.success(params.data);
    }
  });
};
