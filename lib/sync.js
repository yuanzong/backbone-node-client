var _ = require('underscore');
var request = require('request');

var methodMap = {
  create: 'post',
  update: 'put',
  patch: 'patch',
  read: 'get',
  delete: 'del'
};

function urlError () {
  throw new Error('"url" is not specified');
}

module.exports = function (method, model, options) {
  var type = methodMap[method];

  // Default JSON-request options.
  var params = {type: type, dataType: 'json'};

  // Ensure that we have a URL.
  if (!options.url) {
    try {
      params.url = _.result(model, 'url') || urlError();
    } catch (err) {
      return options.error(err);
    }
  }

  // Ensure that we have the appropriate request data.
  if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.contentType = 'application/json';
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  return request(_.extend(params, options), function (err, resp) {
    err ? options.error(err) : options.success(null, resp);
  });
};
