var _ = require('underscore');
var Backbone = require('backbone');
var mixin = require('./mixin');

Backbone.sync = function sync (method, model, options) {
  var params = _.extend({dataType: 'json'}, options);

  if (!params.url) {
    try {
      params.url = _.result(this, 'url');
    } catch (err) {}
  }

  if (!params.url) {
    return options.error(
      model.error('A "url" property or function must be specified')
    );
  }

  // Ensure that we have the appropriate request data.
  if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = options.attrs || model.toJSON(options);
  }

  return model.request(method, params);
};

var Model = Backbone.Model.extend({
  fetch: function (options, cb) {
    options = this.adjustOptions(options, cb);
    return Backbone.Model.prototype.fetch.call(this, options);
  },
  destroy: function (options, cb) {
    options = this.adjustOptions(options, cb);
    return Backbone.Model.prototype.destroy.call(this, options);
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

    options = this.adjustOptions(options, cb);
    return Backbone.Model.prototype.save.call(this, attrs, options);
  }
});

var Collection = Backbone.Collection.extend({
  create: function (model, options, cb) {
    options = this.adjustOptions(options, cb);
    return Backbone.Collection.prototype.create.call(this, model, options);
  },
  fetch: function (options, cb) {
    options = this.adjustOptions(options, cb);
    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

exports.Model = mixin(Model);
exports.Collection = mixin(Collection);
