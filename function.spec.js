const func = require('./function');

const generateDropboxUrl = func.generateDropboxUrl;
const handleUpstreamResponse = func.handleUpstreamResponse;
const respondWithError = func.respondWithError;

test('generateDropboxUrl', () => {
  const result = generateDropboxUrl('https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
  expect(result).toBe('https://www.dropbox.com/s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
});

test('handleUpstreamResponse with found result', () => {
  const context = {
    done: jest.fn()
  };

  const result = {
    headers: {
      location: 'https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file'
    },
    statusCode: 302,
    statusMessage: 'Found'
  };

  handleUpstreamResponse(context)(result);

  expect(context.res).toStrictEqual({
    body: null,
    headers: {
      'access-control-allow-origin': '*',
      location: 'https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file'
    },
    status: 302
  });
  expect(context.done.mock.calls.length).toBe(1);
});

test('handleUpstreamResponse with not found result', () => {
  const context = {
    done: jest.fn()
  };

  const result = {
    statusCode: 404,
    statusMessage: 'Not Found'
  };

  handleUpstreamResponse(context)(result);

  expect(context.res).toStrictEqual({
    body: {
      error: 'Not Found'
    },
    status: 404
  });
  expect(context.done.mock.calls.length).toBe(1);
});

test('respondWithError', () => {
  const context = {
    done: jest.fn()
  };

  respondWithError(context, 403, 'Forbidden');

  expect(context.res).toStrictEqual({
    body: {
      error: 'Forbidden'
    },
    status: 403
  });
  expect(context.done.mock.calls.length).toBe(1);
});
