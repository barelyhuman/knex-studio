export async function rehydrate() {
  const json = document.querySelector('script#_meta').innerHTML
  const appContainer = document.getElementById('app')
  const meta = JSON.parse(json)
  const component = await import(meta.path)
  if (component.state && meta.state) {
    Object.assign(component.state, meta.state)
  }

  if ('onClient' in component && typeof component.onClient == 'function') {
    await component.onClient()
  }

  const mount = component.view()
  appContainer.innerHTML = ''
  mount(appContainer)
}
