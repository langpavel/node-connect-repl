# node-connect-repl

Inject REPL into connect/express as middleware.

Middleware is loaded only in environment **other** than `production`

Following is exported into REPL:
 * `last_req` -- last request object
 * `last_res` -- last response object
 * `stop` -- boolean. Set to true if you want "set breakpoint" in next request
 * `next` -- function. Call if you want to continue after `stop` request
 * `req` -- current request object when stopped
 * `res` -- current response object when stopped

## Example

```js
var express = require('express');
var app = express();

// ...
app.use(require('connect-repl')());

// some routes...

app.listen(3000);
```

