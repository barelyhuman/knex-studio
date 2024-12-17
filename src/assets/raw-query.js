import { mountTable } from './table.js'

const form = document.querySelector('form')
const button = form.querySelector('button')

button.addEventListener('click', e => {
  e.preventDefault()
  const fd = new FormData(form)
  const sql = fd.get('query-input')
  fetchResult(sql)
})

form.addEventListener('submit', e => {
  e.preventDefault()
})

async function fetchResult(query) {
  try {
    document.querySelector('#result-error').textContent = ''
    const result = await fetch('/api/raw', {
      method: 'POST',
      body: btoa(query),
    }).then(d => {
      if (!d.ok) {
        throw d
      }
      return d.json()
    })

    mountTable('#datatable-result', {
      data: result,
    })
  } catch (err) {
    if ('json' in err) {
      const errorBody = await err.json()
      document.querySelector('#result-error').textContent =
        errorBody.error.message
    }
    throw err
  }
}
