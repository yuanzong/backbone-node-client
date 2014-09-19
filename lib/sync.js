var _ = require('underscore');

var methodMap = {
  create: 'post',
  update: 'put',
  patch: 'patch',
  read: 'get',
  delete: 'del'
};

module.exports = function sync (method, model, options) {
  var type = methodMap[method];
  var params = _.extend({
    type: type,
    method: type,
    dataType: 'json'
  }, options);

  // Ensure that we have the appropriate request data.
  if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
    params.contentType = 'application/json';
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  return model.request(params);
};
