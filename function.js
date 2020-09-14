const https = require('https');
const url = require('url');

class HttpError extends Error {
  constructor (message, code) {
    super(message);

    this.code = code;
  }
}

const generateDropboxUrl = (param) => {
  if (!param || !param.startsWith('https://www.dropbox.com/')) {
    throw new HttpError('Forbidden', 403);
  }

  const dropboxUrl = url.parse(param);
  const path = dropboxUrl.path;
  const pathParts = path.split('/');

  pathParts.shift();
  pathParts.splice(1, 0, 'raw');
  const rawPath = pathParts.join('/');

  return `https://${dropboxUrl.hostname}/${rawPath}`;
};

const respondWithError = (context, status, error) => {
  context.res = {
    body: { error },
    status
  };
  context.done();
};

const upstreamResponseHandler = context => response => {
  if (response.statusCode !== 302) {
    throw new HttpError(response.statusMessage, response.statusCode);
  }

  context.res = {
    body: null,
    headers: {
      'access-control-allow-origin': '*',
      location: response.headers.location
    },
    status: response.statusCode
  };
  context.done();
};

module.exports = (context, req) => {
  try {
    https.get(
      generateDropboxUrl(req.query.dropboxUrl),
      upstreamResponseHandler(context)
    );
  } catch (error) {
    respondWithError(context, error.code, error.message);
  }
};

module.exports.generateDropboxUrl = generateDropboxUrl;
module.exports.respondWithError = respondWithError;
module.exports.upstreamResponseHandler = upstreamResponseHandler;
