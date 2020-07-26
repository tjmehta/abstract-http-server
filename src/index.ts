import AbstractStartable, {
  StopOptsType as StartableStopOptsType,
} from 'abstract-startable'
import { ListenOptions, Socket } from 'net'
import http, {
  IncomingMessage,
  Server,
  ServerOptions,
  ServerResponse,
} from 'http'

import BaseError from 'baseerr'

export class HttpServerStartError extends BaseError<{ opts?: ListenOptions }> {}
export class HttpServerStopError extends BaseError<{}> {}

export type OptsType = ServerOptions & {
  logger?: {
    info: (...args: Array<any>) => void
    error: (...args: Array<any>) => void
  }
}

export type StartOptsType = ListenOptions
export type StopOptsType = StartableStopOptsType

export default abstract class AbstractHttpServer extends AbstractStartable {
  protected sockets: Set<Socket>
  protected logger: NonNullable<OptsType['logger']>
  protected server: Server
  constructor(opts: OptsType = {}) {
    super()
    this.sockets = new Set()
    this.logger = opts.logger || console
    this.server = http.createServer(opts)
    process.nextTick(() => {
      // without this tick, bound functions will not be set and listeners will not be overridden by children.
      this.server.on('connection', this.handleConnection)
      this.server.on('request', this.handleRequest)
    })
  }
  protected handleConnection = (socket: Socket) => {
    this.sockets.add(socket)
    socket.once('close', () => this.sockets.delete(socket))
  }
  handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): void | Promise<void> {
    res.statusCode = 404
    res.end()
  }
  async _start(opts: StartOptsType = {}) {
    await new Promise((resolve, reject) => {
      const { logger, server } = this
      logger.info('http server: starting...', opts)
      server.listen({
        port: 3000,
        ...opts,
      })
      server.once('listening', handleListening)
      server.once('error', handleError)
      function cleanup() {
        server.off('listening', handleListening)
        server.off('error', handleError)
      }
      function handleListening() {
        cleanup()
        logger.info('http server: started', opts)
        resolve()
      }
      function handleError(err: Error) {
        err = HttpServerStartError.wrap(err, 'error starting http server', opts)
        cleanup()
        logger.error('http server: start errored', { err })
        reject(err)
      }
    })
  }
  async _stop(opts: StopOptsType = {}) {
    await new Promise((resolve, reject) => {
      const { logger, server, sockets } = this
      logger.info('http server: stopping...', opts)
      server.close((err) => {
        if (err) {
          err = HttpServerStartError.wrap(
            err,
            'error stopping http server',
            opts,
          )
          logger.error('http server: stop errored', { err })
          reject(err)
          return
        }
        logger.info('http server: stopped', opts)
        resolve()
      })
      if (opts?.force) {
        sockets.forEach((socket) => {
          socket.destroy()
          sockets.delete(socket)
        })
      }
    })
  }
}
