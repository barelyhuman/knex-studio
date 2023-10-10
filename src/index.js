import { createServer } from './server.js'

/**
 * @params {import("knex").Knex} knexInstance
 */
export function studio(knexInstance) {
  const server = createServer(knexInstance)

  return {
    startServer: async () => {
      await server()
    },
  }
}
