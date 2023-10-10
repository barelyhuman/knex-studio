import { studio } from '../src/index.js'
import knexfile from './knexfile.mjs'
import knex from 'knex'

const instance = knex(knexfile.development)
const _studio = studio(instance)
await _studio.startServer()
