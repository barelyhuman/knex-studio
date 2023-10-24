import * as acorn from 'acorn'
import { generate } from 'astring'
import esbuild from 'esbuild'
import { readFile } from 'node:fs/promises'

export function clientRender() {
  return {
    name: 'client_env',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, async () => {
        // Nothing has side-effects, since it's for DCE anyway
        return {
          sideEffects: false,
        }
      })
      build.onLoad({ filter: /\.js$/ }, async args => {
        const source = await readFile(args.path, 'utf8')

        const ast = acorn.parse(source, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        })

        let onServerOn
        for (let nodeIndex in ast.body) {
          const node = ast.body[nodeIndex]
          if (node.type == 'ExportNamedDeclaration') {
            if (
              node.declaration &&
              node.declaration.type == 'VariableDeclaration'
            ) {
              for (let decl of node.declaration.declarations) {
                if (decl.id && decl.id.type === 'Identifier') {
                  if (decl.id.name == 'onServer') {
                    onServerOn = nodeIndex
                  }
                }
              }
            }
          }
        }

        ast.body = ast.body.filter((x, i) => i != onServerOn)
        const content = await esbuild.transform(generate(ast), {
          treeShaking: true,
          platform: 'browser',
        })

        return {
          contents: content.code,
        }
      })
    },
  }
}
