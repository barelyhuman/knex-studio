import { DataTable } from 'simple-datatables'

const $ = document.querySelector.bind(document)

export function mountTable(element, props) {
  const el = $(element)

  new DataTable(el, props)
  const wrapper = el.parentNode.parentNode

  // Styles
  const searchElem = wrapper.querySelector('.datatable-search')
  searchElem.querySelector('input').classList.add('form-control')

  const selector = wrapper.querySelector('.datatable-selector')
  selector.classList.add('form-select')

  wrapper.querySelector(
    '.datatable-top > .datatable-dropdown > label'
  ).style.minWidth = '250px'
  wrapper.querySelector(
    '.datatable-top > .datatable-dropdown .datatable-selector'
  ).style.width = '80px'
}
