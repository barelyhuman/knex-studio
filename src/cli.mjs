#!/usr/bin/env node
import { resolve } from 'node:path'
import knex from 'knex'
import mri from 'mri'
import { studio } from './index.mjs'

async function main() {
  const args = mri(process.argv.slice(2))
  const knexFilePath = args._[0]
  const knexfile = (await import(resolve(knexFilePath))).default
  const db = knex(knexfile[process.env.NODE_ENV ?? 'development'])
  await studio(db).listen(3000)
}

main()
