import { request } from '../../lib/httpClient'

export async function fetchDepartments({ page = 1, perPage = 50, isActive } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)
  if (isActive !== undefined && isActive !== null) params.set('is_active', isActive ? 1 : 0)

  return request(`/departments?${params.toString()}`)
}

export async function fetchDepartment(id) {
  return request(`/departments/${id}`)
}

export async function createDepartment(data) {
  return request('/departments', { method: 'POST', body: data })
}

export async function updateDepartment(id, data) {
  return request(`/departments/${id}`, { method: 'PUT', body: data })
}

export async function deleteDepartment(id) {
  return request(`/departments/${id}`, { method: 'DELETE' })
}
