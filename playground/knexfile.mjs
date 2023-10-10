// Update with your config settings.
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: join(__dirname, './dev.sqlite3'),
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'migrations',
      extension: 'mjs',
      loadExtensions: ['.mjs'],
    },
  },
}
