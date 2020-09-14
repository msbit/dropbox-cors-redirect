const https = require('https');
const url = require('url');

class HttpError extends Error {
  constructor (code, message) {
    super(message);

    this.code = code;
  }
}

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
  if (!param || !param.startsWith('https://www.dropbox.com/')) {
    throw new HttpError(403, 'Forbidden');
  }

  const dropboxUrl = url.parse(param);
  const path = dropboxUrl.path;
  const pathParts = path.split('/');

  pathParts.shift();
  pathParts.splice(1, 0, 'raw');
  const rawPath = pathParts.join('/');

  return `https://${dropboxUrl.hostname}/${rawPath}`;
};

module.exports = (context, req) => {
  let dropboxUrl;

  try {
    dropboxUrl = generateDropboxUrl(req.query.dropboxUrl);
  } catch (error) {
    respondWithError(context, error.code, error.message);
    return;
  }

  https.get(dropboxUrl, handleUpstreamResponse(context));
};

module.exports.generateDropboxUrl = generateDropboxUrl;
module.exports.handleUpstreamResponse = handleUpstreamResponse;
module.exports.respondWithError = respondWithError;
