import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { join } from 'path'
import { build } from 'esbuild'
import fp from 'fastify-plugin'
import glob from 'tiny-glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default fp(
  (f, o, d) => {
    f.decorateReply('view', function (template, args) {
      return this._view(template, {
        ...args,
        linkStyle: file => {
          return `<link rel="stylesheet" href="${file}">`
        },
        linkScript: scriptName => {
          return `<script type="module" src="${scriptName}"></script>`
        },
      })
    })
    d()
  },
  {
    name: 'view',
  }
)
