# AbstractHttpServer

AbstractHttpServer is a thin wrapper class over node's http server

# Installation

```sh
npm i --save abstract-http-server
```

# Usage

#### Supports both ESM and CommonJS

```js
// esm
import AbstractHttpServer from 'abstract-http-server'
// commonjs
const AbstractHttpServer = require('abstract-http-server').default
```

#### Hello World Example

Create and start "hello world" server using AbstractHttpServer

```js
import AbstractHttpServer from 'abstract-http-server'

class MyHttpServer extends AbstractHttpServer {
  handleRequest(req, res) {
    res.statusCode = 200
    res.end('Hello World!')
  }
}

const server = new MyHttpServer()
await server.start({ port: 3333 })
// log: http server: starting { port: 3333 }
// log: http server: started { port: 3333 }
```

#### Async/Await Example

handleRequest can be used with async/await

```js
import AbstractHttpServer from 'abstract-http-server'

class MyHttpServer extends AbstractHttpServer {
  async handleRequest(req, res) {
    await Promise.resolve()
    res.statusCode = 200
    res.end('Hello World!')
  }
}
```

#### Constructor Options Example

Constructor, start, and stop options examples

```js
// AbstractHttpServer supports all of http.createServer options and custom logger
const server = new AbstractHttpServer({
  // http server options
  maxHeaderSize: 100;
  insecureHTTPParser: false;
  // additional options
  logger: console,
})

// start all of httpServer.listen options
await server.start({
  // http server listen options
  port: 3333,
  host: 'localhost',
  backlog: 10,
  path: 'foo',
  exclusive: false,
  readableAll: true,
  writableAll: true,
  ipv6Only: false,
})

// stop supports "destroying" a server using the force: true option
await server.stop({
  force: true
})
```

#### Stop Server Example

handleRequest can be used with async/await

```js
import AbstractHttpServer from 'abstract-http-server'

class MyHttpServer extends AbstractHttpServer {
  async handleRequest(req, res) {
    await Promise.resolve()
    res.statusCode = 200
    res.end('Hello World!')
  }
}

const server = new MyHttpServer()
await server.start({ port: 3333 })
// log: http server: starting {}
// log: http server: started {}
await server.stop()
// log: http server: stopping {}
// log: http server: stopped {}
```

#### Errors Example

```js
import AbstractHttpServer from 'abstract-http-server'

class MyHttpServer extends AbstractHttpServer {
  handleRequest(req, res) {
    res.statusCode = 200
    res.end('Hello World!')
  }
}

const server = new MyHttpServer()
try {
  await server.start({ port: 3333 })
} catch (err) {
  // log: http server: start errored: { err: ... }
  if (err instanceof HttpServerStartError) {
    console.error(err)
    /*
    HttpServerStartError: error starting http server
        at Function.wrap (/app/index.ts:51:12)
        ...
    {
      "port": 3333
    }
    ----
    Error: listen EADDRINUSE: address already in use :::3333
        at Server.setupListenHandle [as _listen2] (net.js:1313:16)
        ...
    */
    console.error(err.source)
    /*
    Error: listen EADDRINUSE: address already in use :::3333
        at Server.setupListenHandle [as _listen2] (net.js:1313:16)
        ...
    */
  }
  // ...
}
try {
  await server.stop()
} catch (err) {
  // log: http server: stop errored: { err: ... }
  if (err instanceof HttpServerStopError) {
    console.error(err)
    /*
    HttpServerStopError: error starting http server
        at Function.wrap (/app/index.ts:51:12)
        ...
    {}
    ----
    Error: foo
        at ...
        ...
    */
    console.error(err.source)
    /*
    Error: foo
        at ...
        ...
    */
  }
  // ...
}
```

# License

MIT
