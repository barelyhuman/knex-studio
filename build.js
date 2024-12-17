import { build } from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import { nodeExternals } from 'esbuild-plugin-node-externals'
import glob from 'tiny-glob'

await build({
  entryPoints: ['./src/index.js', './src/cli.js'],
  format: 'esm',
  bundle: true,
  treeShaking: true,
  //   splitting: true,
  platform: 'node',
  outdir: 'dist',
  plugins: [
    nodeExternals(),
    copy({
      assets: [
        {
          from: './src/views/**/*',
          to: './views',
        },
      ],
    }),
  ],
})

const entries = await glob('./src/assets/**/*.{css,js}', {
  filesOnly: true,
})

await build({
  entryPoints: entries,
  format: 'esm',
  bundle: true,
  entryNames: '[dir]/[name]',
  treeShaking: true,
  //   splitting: true,
  platform: 'browser',
  outdir: 'dist/assets',
  plugins: [nodeExternals()],
})
