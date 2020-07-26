import http, { IncomingMessage, ServerResponse } from 'http'

import AbstractHttpServer from '../index'
import concat from 'concat-stream'

const port = 3334

describe('AbstractHttpServer', () => {
  let server
  let server1
  let server2

  afterEach(async () => {
    await server.stop({ force: true })
    await server1?.stop({ force: true })
    await server2?.stop({ force: true })
  })

  it('should create, start, stop a hello world server', async () => {
    class MyHttpServer extends AbstractHttpServer {
      handleRequest(req: IncomingMessage, res: ServerResponse) {
        res.statusCode = 200
        res.end('hello world!')
      }
    }
    server = new MyHttpServer({
      logger: { info: () => {}, error: () => {} },
    })
    await server.start({ port })
    try {
      const body = await new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:${port}`, (res) => {
          res.once('error', reject)
          res.pipe(
            concat((body) => {
              resolve(body.toString())
            }),
          )
        })
        req.once('error', reject)
        req.end()
      })
      expect(body).toMatchInlineSnapshot(`"hello world!"`)
    } finally {
      await server.stop()
    }
  })

  it('should error StartHttpServerError if server listening on same port', async () => {
    class MyHttpServer extends AbstractHttpServer {
      handleRequest(req: IncomingMessage, res: ServerResponse) {
        res.statusCode = 200
        res.end('hello world!')
      }
    }
    server1 = new MyHttpServer({
      logger: { info: () => {}, error: () => {} },
    })
    server2 = new MyHttpServer({
      logger: { info: () => {}, error: () => {} },
    })
    await server1.start({ port })
    try {
      await expect(async () => {
        await server2.start({ port })
      }).rejects.toMatchInlineSnapshot(
        `[HttpServerStartError: error starting http server]`,
      )
    } finally {
      await server1.stop()
    }
  })

  it('should create, start, force stop an http server w/ open requests', async () => {
    class MyHttpServer extends AbstractHttpServer {
      handleRequest = (req: IncomingMessage, res: ServerResponse) => {
        res.statusCode = 200
        res.write('test')
        const id = setInterval(() => {
          const wrote = res.write('bad')
          if (!wrote) clearInterval(id)
        }, 10)
        this.server.once('close', () => {
          clearInterval(id)
        })
      }
    }
    server = new MyHttpServer({
      logger: { info: () => {}, error: () => {} },
    })
    await server.start({ port })
    try {
      await new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:${port}`, resolve)
        req.once('error', reject)
        req.end()
      })
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await server.stop({ force: true })
    }
  })
})
