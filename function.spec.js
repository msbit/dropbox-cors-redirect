const func = require('./function');
const generateDropboxUrl = func.generateDropboxUrl;

test('generateDropboxUrl', () => {
  const result = generateDropboxUrl('https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
  expect(result).toBe('https://www.dropbox.com/s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0');
});
