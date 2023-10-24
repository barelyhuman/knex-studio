import { html } from '@arrow-js/core'
import { renderToString } from 'arrow-render-to-string'
import fp from 'fastify-plugin'
import { join } from 'path'

const wrapper = `
  <!doctype html>
  <html>
    <body>
      %app%
      <script src="/script.js"></script>
    </body>
  </html>
`

function createRenderView(baseDirectory) {
  return async function (view) {
    const mod = await import(join(baseDirectory, view))
    const reply = this || { header() {}, send() {} }

    const meta = {
      path: join('/', 'islands', view),
      state: mod.state,
    }

    'onServer' in mod && (await mod.onServer())

    const _wrapper = html`
      ${mod.view()}
      <script type="text/json" id="_meta">
        ${JSON.stringify(meta)}
      </script>
    `

    const finalTmp = wrapper.replace('%app%', renderToString(_wrapper))

    reply.header(`content-type`, 'text/html')
    reply.send(finalTmp)
  }
}

function _fastifyArrow(fastify, opts, next) {
  fastify.decorateReply('renderArrow', function (_page, options) {
    const source = options.baseDirectory || opts.sourceDirectory
    const view = createRenderView(join(source, 'pages'))
    return view.apply(this, [_page])
  })

  next()
}

export const fastifyArrow = fp(_fastifyArrow, {
  fastify: '4.x',
  name: 'fastify-arrow',
})
