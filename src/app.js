import esbuild from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export const app = {
  functions: {},
}

init()

async function init() {
  patchPaths()
  addModuleLoader()
  await buildWebAssets(process.env.NODE_ENV !== 'production')
}

function patchPaths() {
  let __dirname
  if (typeof module !== 'undefined') {
    __dirname = global.__dirname
  } else {
    __dirname = dirname(fileURLToPath(import.meta.url))
  }

  app.root = process.cwd()

  // Considering app is at the root of src
  app.sourceDirectory = join(__dirname)
}

async function buildWebAssets(watch) {
  const scriptFile = 'script.js'
  const entryFile = join(app.sourceDirectory, 'www', scriptFile)
  const outfile = join(app.sourceDirectory, 'www', 'dist', scriptFile)
  await mkdir(dirname(outfile), { recursive: true })
  if (watch) {
    //TODO: Write watcher
  }
  await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    outfile: outfile,
    platform: 'browser',
  })
}

function addModuleLoader() {
  const api = {
    _modules: [],
  }
  api.addModule = fn => {
    api._modules.push(fn)
    return api
  }
  api.loadModules = async () => {
    for (let mod of api._modules) {
      let loader = 'default' in mod ? mod.default : mod
      await loader(app)
    }
  }

  Object.assign(app, api)
}
