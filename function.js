const https = require('https');
const url = require('url');

const respondWithError = (context, status, error) => {
  context.res = {
    body: { error },
    status
  };
  context.done();
};

const handleUpstreamResponse = context => result => {
  if (result.statusCode !== 302) {
    respondWithError(context, result.statusCode, result.statusMessage);
    return;
  }

  context.res = {
    body: null,
    headers: {
      'access-control-allow-origin': '*',
      location: result.headers.location
    },
    status: result.statusCode
  };
  context.done();
};

const generateDropboxUrl = (param) => {
  const dropboxUrl = url.parse(param);
  const path = dropboxUrl.path;
  const pathParts = path.split('/');

  pathParts.shift();
  pathParts.splice(1, 0, 'raw');
  const rawPath = pathParts.join('/');

  return `https://${dropboxUrl.hostname}/${rawPath}`;
};

module.exports = (context, req) => {
  const dropboxUrlParam = req.query.dropboxUrl;

  if (!dropboxUrlParam || !dropboxUrlParam.startsWith('https://www.dropbox.com/')) {
    respondWithError(context, 403, 'Forbidden');
    return;
  }

  https.get(
    generateDropboxUrl(dropboxUrlParam),
    handleUpstreamResponse(context)
  );
};

module.exports.generateDropboxUrl = generateDropboxUrl;
module.exports.handleUpstreamResponse = handleUpstreamResponse;
module.exports.respondWithError = respondWithError;
