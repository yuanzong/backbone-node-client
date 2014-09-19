var methodMap = {
  create: 'post',
  update: 'put',
  patch: 'patch',
  read: 'get',
  delete: 'del'
};

module.exports = function (method, model, options) {
  var params = {
    method: methodMap[method],
    path: options.path,
    dataType: 'json'
  };

  if (!options.path) {
    try {
      params.path = _.result(model, 'url');
    } catch (e) {
      var err = errorUtils.wrapError(e, this.toJSON());
      return options.apiError(err);
    }
  }

  if (!options.data && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = options.attrs || model.toJSON(options);
  }

  var request = this.apiClient.request(params, function handleResult (err, resp) {
    err ? options.apiError(err, resp) : options.success(resp);
  });
  model.trigger('request', model, request, options);
  return request;
};
