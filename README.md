backbone-node-client
====================

Use backbone in backend in node style


### how to use

a mixin to use backbone in node style
 
these build-in functions has been modified, last parameter is required as a callback function

all the backbone behavior has been maintained, meaning all the events, validations

in case of success and failure, cb will be triggered in node convention ==> cb(err, model, resp)
    
    Model#fetch ==> function (options, cb)

    Model#save ==> function (options, cb)

    Model#destroy ==> function (key, val, options, cb)

    Collection#fetch ==> function (options, cb)

    Collection#create ==> function (model, options, cb)


implement this Model#request and Collection#request for network requests

    request: function (method, params) {
        method: create|update|patch|read|delete
        params: { url, error, success }
    }
    
    
### example

    var backboneNodeClient = require('backbone-node-client');
    
    var Model = backboneNodeClient.Model.extend({
        urlRoot: '/root'
    });
    
    var Collection = backboneNodeClient.Collection.extend({
        model: Model,
        url: Model.prototype.urlRoot
    });
    
    var model = new Model({id: 123});
    var collection = new Collection(model);
    
    model.fetch(cb);
    model.save('anotherKey', 'anotherValue', cb);
    model.save({anotherKey: 'anotherValue'}, cb);
    model.destroy(function () {});
    
    collection.fetch(cb);
    collection.create(new Model({id: 456}), cb);


### tests

    npm run test

