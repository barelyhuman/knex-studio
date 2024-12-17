import fp from 'fastify-plugin'
import pkg from 'knex-schema-inspector'

export default fp(
  (f, o, d) => {
    f.decorate('db', o.knexInstance)
    f.decorate('dbSchemaInspector', pkg.default(o.knexInstance))
    d()
  },
  {
    name: 'db',
  }
)
