import { request } from '../../lib/httpClient'

export async function fetchCustomers({ page = 1, perPage = 15, search, source } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)
  if (search) params.set('search', search)
  if (source) params.set('source', source)

  return request(`/customers?${params.toString()}`)
}

export async function fetchCustomer(id) {
  return request(`/customers/${id}`)
}

export async function fetchCustomerTimeline(id) {
  return request(`/customers/${id}/timeline`)
}

export async function createCustomer(data) {
  return request('/customers', { method: 'POST', body: data })
}

export async function updateCustomer(id, data) {
  return request(`/customers/${id}`, { method: 'PUT', body: data })
}

export async function deleteCustomer(id) {
  return request(`/customers/${id}`, { method: 'DELETE' })
}
