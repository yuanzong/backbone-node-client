var _ = require('underscore');
var assert = require('assert');
var Model = require('../lib/').Model;
var Collection = require('../lib/').Collection;

var data = {
  id: 'something',
  requiredKey: Math.random(),
  someKey: Math.random()
};

var BaseModel = Model.extend({
  urlRoot: '/root',
  validate: function () {
    if (!this.get('requiredKey')) {
      return this.error('missing required key');
    }
  }
});

describe('backbone-mixin-model', function () {
  beforeEach(function () {
    this.model = new BaseModel(data);
  });

  it('basic setup works', function () {
    assert.equal(this.model.id, data.id);
    assert.equal(this.model.get('requiredKey'), data.requiredKey);
    assert.equal(this.model.get('someKey'), data.someKey);
    assert(_.isFunction(this.model.request));
  });

  describe('model#save', function () {
    it('should fail without urlRoot', function (done) {
      this.model.urlRoot = null;
      this.model.save(null, function (err) {
        assert.equal(err.name, Model.prototype.ERROR_NAME);
        assert.deepEqual(err.details, data);
        done();
      });
    });

    it('should fail with validation error', function (done) {
      this.model.unset('requiredKey');
      this.model.save(null, function (err) {
        assert.equal(err.name, Model.prototype.ERROR_NAME);
        assert.deepEqual(err.details, _.omit(data, 'requiredKey'));
        done();
      });
    });

    it('save a new model', function (done) {
      this.model.unset('id');
      this.model.request = function (method, params) {
        assert.equal(method, 'create');
        assert.equal(params.url, BaseModel.prototype.urlRoot);
        assert.equal(params.data, JSON.stringify(_.omit(data, 'id')));
        params.success();
      };

      this.model.save(null, function (err) {
        assert.equal(err, null);
        done();
      });
    });

    it('save an existing model', function (done) {
      this.model.request = function (method, params) {
        assert.equal(method, 'update');
        assert.equal(params.url, BaseModel.prototype.urlRoot + '/' + data.id);
        assert.equal(params.data, JSON.stringify(data));
        params.success();
      };

      this.model.save(null, function (err) {
        assert.equal(err, null);
        done();
      });
    });

    it('save key val pair', function (done) {
      var key = 'hello';
      var value = 'world';

      this.model.request = function (method, params) {
        var json = JSON.parse(params.data);
        assert.equal(json.id, data.id);
        assert.equal(json.requiredKey, data.requiredKey);
        assert.equal(json[key], value);
        params.success(json);
      };

      this.model.save(key, value, function (err, model) {
        assert.equal(err, null);
        assert.equal(model.get(key), value);
        done();
      });
    });

    it('save attr map', function (done) {
      var extra = {hello: 'world'};
      this.model.request = function (method, params) {
        var json = JSON.parse(params.data);
        assert.deepEqual(json, _.extend(extra, data));
        params.success(json);
      };

      this.model.save(extra, function (err, model) {
        assert.equal(err, null);
        assert.equal(model.get('hello'), 'world');
        done();
      });
    });
  });

  describe('model#fetch', function () {
    it('fetch existing model', function (done) {
      this.model.request = function (method, params) {
        assert.equal(method, 'read');
        assert.equal(params.data, undefined);
        assert.equal(params.url, BaseModel.prototype.urlRoot + '/' + data.id);
        params.success({newKey: true});
      };

      this.model.fetch(function (err, model) {
        assert.equal(err, null);
        assert.equal(model.get('newKey'), true);
        done();
      });
    });

    it('fetch new model', function (done) {
      this.model.unset('id');
      this.model.request = function (method, params) {
        assert.equal(method, 'read');
        assert.equal(params.data, undefined);
        assert.equal(params.url, BaseModel.prototype.urlRoot);
        params.success();
      };

      this.model.fetch(done);
    });
  });

  describe('model#destroy', function () {
    it('destroy existing model', function (done) {
      this.model.request = function (method, params) {
        assert.equal(method, 'delete');
        assert.equal(params.data, undefined);
        assert.equal(params.url, BaseModel.prototype.urlRoot + '/' + data.id);
        params.success();
      };

      this.model.destroy(done);
    });

    it('destroy new model', function (done) {
      this.model.unset('id');
      this.model.request = function (method) {
        assert.fail('destroy new model should not trigger a network request', method);
        done();
      };
      this.model.destroy(done);
    });
  });
});

describe('backbone-mixin-collection', function () {
  var BaseCollection = Collection.extend({
    model: BaseModel,
    url: BaseModel.prototype.urlRoot
  });

  beforeEach(function () {
    this.collection = new BaseCollection(new BaseModel(data));
  });

  it('basic setup works', function () {
    assert.equal(this.collection.length, 1);
    assert.equal(this.collection.url, BaseModel.prototype.urlRoot);
  });

  describe('collection#fetch', function () {
    it('should fail without url', function (done) {
      this.collection.url = null;
      this.collection.fetch(function (err) {
        assert.equal(err.name, Collection.prototype.ERROR_NAME);
        assert.deepEqual(err.details, [data]);
        done();
      });
    });

    it('should fetch more data', function (done) {
      this.collection.request = function (method, params) {
        assert.equal(method, 'read');
        assert.equal(params.url, BaseCollection.prototype.url);
        params.success(['test1', 'test2'].map(function (name) {
          return {id: _.uniqueId('cox'), requiredKey: name};
        }));
      };
      this.collection.fetch(function (err, collection) {
        assert.equal(err, null);
        assert.equal(collection.length, 2);
        done();
      });
    });
  });

  describe('collection#create', function () {
    it('should fail validation', function (done) {
      var modelAttr = {id: 'does not matter'};
      this.collection.create(modelAttr, function (err) {
        assert.equal(err.name, Collection.prototype.ERROR_NAME);
        assert.deepEqual(err.details, modelAttr);
        done();
      });
    });

    it('add existing model to collection', function (done) {
      var modelAttr = {id: 'does not matter', requiredKey: true};
      this.collection.request = function (method) {
        assert.fail('should not trigger network call', method);
        done();
      };
      this.collection.create(modelAttr, function (err, model) {
        assert.equal(err, null);
        assert.deepEqual(model.attributes, modelAttr);
        assert.equal(model.collection.length, 2);
        done();
      });
    });

    it('add a new model to collection', function (done) {
      var modelAttr = {requiredKey: true};
      this.collection.request = function (method, params) {
        assert.equal(method, 'create');
        assert.equal(params.url, BaseCollection.prototype.url);
        assert.equal(params.data, JSON.stringify(modelAttr));
        modelAttr.id = _.uniqueId('crazy!');
        params.success(modelAttr);
      };
      this.collection.create(modelAttr, function (err, model) {
        assert.equal(err, null);
        assert.deepEqual(model.attributes, modelAttr);
        assert.equal(model.collection.length, 2);
        done();
      });
    });
  });
});
