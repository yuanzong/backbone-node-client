var _ = require('underscore');

module.exports = function (parent) {
  return parent.extend({
    error: function (message) {
      var err = new Error(message);
      err.name = 'backbone-node-client';
      err.status = 500;
      err.details = this.toJSON();
      return err;
    },

    adjustOptions: function (options, cb) {
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }

      if (!_.isFunction(cb)) {
        throw this.error('"callback" function is required');
      }

      try {
        options.url = options.url || _.result(this, 'url');
      } catch (err) {
        return cb(this.error(err.message));
      }

      if (!options.url) {
        return cb(this.error('A "url" property or function must be specified'));
      }

      var that = this;
      var onInvalid = function (model, err) {
        cb(err, model);
      };

      this.once('invalid', onInvalid);

      options.success = function (model, resp) {
        that.off('invalid', onInvalid);
        cb(null, model, resp);
      };

      options.error = function (model, err) {
        that.off('invalid', onInvalid);
        cb(err, model);
      };

      return options;
    },

    // implement custom sync function
    request: function (params) {
      return params.success(_.pick(params, 'method', 'data', 'url'));
    }
  });
};
