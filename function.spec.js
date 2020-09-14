const func = require('./function');

const generateDropboxUrl = func.generateDropboxUrl;
const respondWithError = func.respondWithError;

test('generateDropboxUrl', () => {
  const result = generateDropboxUrl('https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
  expect(result).toBe('https://www.dropbox.com/s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
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
