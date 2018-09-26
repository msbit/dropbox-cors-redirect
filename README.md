## Dropbox CORS Redirect

Simple redirector for Dropbox links, to ensure that required CORS headers are in place.

### Background

When a Dropbox link is fetched, it returns a redirection to the actual file location. The issue that arises is that these redirections (there can be more than one depending on the initial link) don't add the required `access-control-allow-origin` header. For example, starting with the Dropbox link `https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0`, we have the following requests:

```bash
curl  -L -v \
      -H 'Origin: http://www.example.com' \
      'https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0' 2>&1 > /dev/null \
      | grep -i -e '^< access-control-' -e '^< http' -e '^< location'
```

```
< HTTP/2 301
< location: /s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg
< HTTP/2 302
< location: https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file
< HTTP/2 200
< access-control-allow-origin: *
< access-control-expose-headers: Accept-Ranges, Content-Encoding, Content-Length, Content-Range, X-Dropbox-Metadata, X-Dropbox-Request-Id, X-JSON, X-Server-Response-Time, Timing-Allow-Origin, x-dropbox-pdf-password-needed
```

Note that, throughout the redirects, there are no `access-control-*` headers being returned; only for the final request is this the case.

When doing the same from the browser:

```javascript
function on (promise) {
  return promise
    .then(result => [null, result])
    .catch(error => [error, null]);
}

const urls = [
  'https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0',
  'https://www.dropbox.com/s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg',
  'https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file'
];

urls.forEach(async (url) => {
  const request = new Request(url);

  const [error, response] = await on(fetch(request));
  if (response) {
    console.log(`Yay: status: ${response.status} redirected: ${response.redirected} type: ${response.type}`);
  } else {
    console.log(`Nay: ${error.message}`);
  }
});
```

we get the following output (re-arranged to reproduce the ordering above):

```
[Error] Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin.
[Error] Fetch API cannot load https://www.dropbox.com/s/4ef30lt0c51o1uf/CalabiYau5.jpg?dl=0 due to access control checks.
[Error] Failed to load resource: Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin. (CalabiYau5.jpg, line 0)
[Log] Nay: Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin. (example.js, line 20)

[Error] Cross-origin redirection to https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file denied by Cross-Origin Resource Sharing policy: Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin.
[Error] Fetch API cannot load https://www.dropbox.com/s/raw/4ef30lt0c51o1uf/CalabiYau5.jpg due to access control checks.
[Error] Failed to load resource: Cross-origin redirection to https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file denied by Cross-Origin Resource Sharing policy: Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin. (CalabiYau5.jpg, line 0)
[Log] Nay: Cross-origin redirection to https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file denied by Cross-Origin Resource Sharing policy: Origin http://127.0.0.1:8080 is not allowed by Access-Control-Allow-Origin. (example.js, line 20)

[Log] Yay: status: 200 redirected: false type: cors (example.js, line 18)
```

which reinforces the same.

### Solution

This small function can be hosted on one of the serverless providers (AWS Lambda, Azure Functions or Google Cloud Functions) and will provide an endpoint to pass the unmodified Dropbox link. The response to this request will be a redirect to the final content URL, with the `access-control-allow-origin` header set appropriately.

For example, when deployed to Azure functions, the initial URL can be replaced with:

```
https://<app-name>.azurewebsites.net/api/<function-name>?code=<api-key>&dropboxUrl=https%3A%2F%2Fwww.dropbox.com%2Fs%2F4ef30lt0c51o1uf%2FCalabiYau5.jpg%3Fdl%3D0
```

Fetching that gives us:

```bash
curl  -L -v \
      -H 'Origin: http://www.example.com' \
      'https://<app-name>.azurewebsites.net/api/<function-name>?code=<api-key>&dropboxUrl=https%3A%2F%2Fwww.dropbox.com%2Fs%2F4ef30lt0c51o1uf%2FCalabiYau5.jpg%3Fdl%3D0' 2>&1 > /dev/null \
      | grep -i -e '^< access-control-' -e '^< http' -e '^< location'
```

```
< HTTP/1.1 302 Found
< Location: https://uc062dde02acb0618d3ba6b67ce3.dl.dropboxusercontent.com/cd/0/inline/ARdB4wHUPicq44yKqb9hajAm7XNgMo9EUy8qZgfC4_lVoKmW--Kqf_NeIlGAqcHLViCOJsEFrKN0aGZvQ4UbyyZ0AZ0AUL_uhXw5opFBKMiSAz-523O8S_HpFlibkApxL2Db8NbBsHcONl2hp_712Bx-1BJt0_-4Sbbbh9AJ5Ma2D1qv42i499E59c0DRm1vd08/file
< access-control-allow-origin: *
< HTTP/2 200
< access-control-allow-origin: *
< access-control-expose-headers: Accept-Ranges, Content-Encoding, Content-Length, Content-Range, X-Dropbox-Metadata, X-Dropbox-Request-Id, X-JSON, X-Server-Response-Time, Timing-Allow-Origin, x-dropbox-pdf-password-needed
```

As you can see from the output above, this both skips the intermediate redirect and adds the `access-control-allow-origin` as required.

In the browser:

```javascript
function on (promise) {
  return promise
    .then(result => [null, result])
    .catch(error => [error, null]);
}

const urls = [
  'https://<app-name>.azurewebsites.net/api/<function-name>?code=<api-key>&dropboxUrl=https%3A%2F%2Fwww.dropbox.com%2Fs%2F4ef30lt0c51o1uf%2FCalabiYau5.jpg%3Fdl%3D0'
];

urls.forEach(async (url) => {
  const request = new Request(url);

  const [error, response] = await on(fetch(request));
  if (response) {
    console.log(`Yay: status: ${response.status} redirected: ${response.redirected} type: ${response.type}`);
  } else {
    console.log(`Nay: ${error.message}`);
  }
});

```

gives us:

```
[Log] Yay: status: 200 redirected: true type: cors (example.js, line 16)
```

#### Content image (`CalabiYau5.jpg`) attribution: Andrew J. Hanson, Indiana University.
