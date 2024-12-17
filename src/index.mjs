import { createServer } from './server.js'

export function studio(knexInstance) {
  const server = createServer(knexInstance)
  return {
    listen(port) {
      return server.listen({ port })
    },
  }
}
