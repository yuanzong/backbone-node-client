var Backbone = require('backbone');
var mixin = require('./mixin');

Backbone.sync = require('./sync');

function fetchMaker (Parent) {
  return function fetch (options, cb) {
    options = this.adjustOptions.call(this, options, cb);
    return Parent.prototype.fetch.call(this, options);
  };
}

function destroyMaker (Parent) {
  return function destroy (options, cb) {
    options = this.adjustOptions.call(this, options, cb);
    return Parent.prototype.destroy.call(this, options);
  };
}

function saveMaker (Parent) {
  return function save (key, val, options, cb) {
    var attrs;

    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
      cb = options;
    } else {
      (attrs = {})[key] = val;
    }

    options = this.adjustOptions.call(this, options, cb);
    return Parent.prototype.save.call(this, attrs, options);
  };
}

function createMaker (Parent) {
  return function create (model, options, cb) {
    options = this.adjustOptions.call(this, options, cb);
    return Parent.prototype.create.call(this, model, options);
  };
}

var ModelClass = mixin(Backbone.Model);
exports.Model = ModelClass.extend({
  fetch: fetchMaker(ModelClass),
  destroy: destroyMaker(ModelClass),
  save: saveMaker(ModelClass)
});


var CollectionClass = mixin(Backbone.Collection);
exports.Collection = CollectionClass.extend({
  create: createMaker(CollectionClass),
  fetch: fetchMaker(CollectionClass)
});
