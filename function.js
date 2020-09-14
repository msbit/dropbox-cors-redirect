const https = require('https');
const url = require('url');

const respondWithError = (context, status, error) => {
  context.res = {
    body: { error },
    status
  };
  context.done();
};

module.exports = (context, req) => {
  const dropboxUrlParam = req.query.dropboxUrl;

  if (!dropboxUrlParam || !dropboxUrlParam.startsWith('https://www.dropbox.com/')) {
    respondWithError(context, 403, 'Forbidden');
    return;
  }

  const dropboxUrl = url.parse(dropboxUrlParam);
  const dropboxUrlPath = dropboxUrl.path;
  const dropboxUrlPathParts = dropboxUrlPath.split('/');
  const dropboxUrlRawPath = [dropboxUrlPathParts[1], 'raw', dropboxUrlPathParts[2], dropboxUrlPathParts[3]].join('/');

  https.get(`https://${dropboxUrl.hostname}/${dropboxUrlRawPath}`, result => {
    if (result.statusCode !== 302) {
      respondWithError(context, result.statusCode, result.statusMessage);
      return;
    }

    const headers = {};

    headers.location = result.headers.location;

    headers['access-control-allow-origin'] = '*';

    context.res = {
      body: null,
      headers: headers,
      status: result.statusCode
    };
    context.done();
  });
};
