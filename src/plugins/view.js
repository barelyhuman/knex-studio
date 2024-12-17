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
    let metafile
    f.addHook('onReady', async () => {
      const hasFile = await fs.promises
        .access(join(__dirname, '../metafile.js'))
        .then(() => true)
        .catch(() => false)

      const assets = await glob('**/*.{css,js}', {
        cwd: join(__dirname, '../assets'),
        filesOnly: true,
        absolute: true,
      })

      const output = await build({
        entryPoints: assets,
        format: 'esm',
        bundle: true,
        metafile: true,
        outdir: join(__dirname, '../_public'),
        treeShaking: true,
        splitting: true,
      })

      await fs.promises.writeFile(
        join(__dirname, '../metafile.js'),
        `export default ${JSON.stringify(output.metafile, null, 2)}`,
        'utf8'
      )

      metafile = (await import('../metafile.js')).default
    })

    f.decorateReply('view', function (template, args) {
      return this._view(template, {
        ...args,
        linkStyle: file => {
          if (!metafile.inputs[file]) {
            throw new Error(
              `cannot \`inlineScript\` since the provided asset doesn't exisst ${file}`
            )
          }

          for (let cssOut in metafile.outputs) {
            if (metafile.outputs[cssOut].entryPoint === file) {
              return `<link rel="stylesheet" href="${cssOut.replace(
                'src/',
                '/'
              )}">`
            }
          }
        },
        linkScript: scriptName => {
          if (!metafile.inputs[scriptName]) {
            throw new Error(
              `cannot \`inlineScript\` since the provided asset doesn't exisst ${scriptName}`
            )
          }

          for (let script in metafile.outputs) {
            if (metafile.outputs[script].entryPoint === scriptName) {
              return `<script type="module" src="${script.replace(
                'src/',
                '/'
              )}"></script>`
            }
          }
        },
      })
    })
    d()
  },
  {
    name: 'view',
  }
)
