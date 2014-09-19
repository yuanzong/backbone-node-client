var _ = require('underscore');
var assert = require('assert');
var Backbone = require('backbone');

Backbone.sync = require('./sync');

function adjustOptions (options, cb) {
  var that = this;

  if (_.isFunction(options)) {
    cb = options;
    options = {};
  }

  assert(_.isFunction(cb), '"callback" function is required');

  var invalidHandler = function (model, err) {
    cb(err, model);
  };

  this.once('invalid', invalidHandler);

  options.success = function (model, resp) {
    that.off('invalid', invalidHandler);
    cb(null, model, resp);
  };

  options.error = function (model, err) {
    that.off('invalid', invalidHandler);
    cb(err, model);
  };

  return options;
}

exports.Model = Backbone.Model.extend({
  fetch: function (options, cb) {
    options = adjustOptions.call(this, options, cb);
    Backbone.Model.fetch.call(this, options);
  },

  destroy: function (options, cb) {
    options = adjustOptions.call(this, options, cb);
    Backbone.Model.destroy.call(this, options);
  },

  save: function (key, val, options, cb) {
    var attrs;

    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
      cb = options;
    } else {
      (attrs = {})[key] = val;
    }

    options = adjustOptions.call(this, options, cb);
    Backbone.Model.save.call(this, attrs, options);
  }
});

exports.Collection = Backbone.Collection.extend({
  create: function (model, options, cb) {
    options = adjustOptions.call(this, options, cb);
    Backbone.Collection.create.call(this, model, options);
  },

  fetch: function (options, cb) {
    options = adjustOptions.call(this, options, cb);
    Backbone.Collection.fetch.call(this, options);
  }
});
