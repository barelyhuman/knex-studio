import * as RawSQL from './pages/rawsql'
import * as TableInfoPage from './pages/table-info'
import config from './twind.config'
import { html } from '@arrow-js/core'
import { install } from '@twind/core'

install(config)

let mount

// We don't mind the whole page loading, since most of
// the state is coming from the URL
switch (document.location.pathname) {
  case '/sql': {
    mount = RawSQL.Page
    RawSQL.init()
    break
  }
  case '/tables': {
    mount = TableInfoPage.Page
    TableInfoPage.init()
    break
  }
  case '/': {
    mount = html`<a href="/tables">Tables</a>`
    break
  }
  default: {
    mount = html`<div>
      <p>You look lost</p>
      <a href="/">Let's take you back home</a>
    </div>`
  }
}

const appElement = document.getElementById('app')
mount(appElement)
