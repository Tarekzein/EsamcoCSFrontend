import { request } from '../../lib/httpClient'

export async function fetchUsers({ page = 1, perPage = 15, departmentId } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)
  if (departmentId) params.set('department_id', departmentId)

  return request(`/users?${params.toString()}`)
}

export async function createUser(data) {
  return request('/users', { method: 'POST', body: data })
}

export async function updateUser(id, data) {
  return request(`/users/${id}`, { method: 'PUT', body: data })
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' })
}

export async function assignUserDepartment(id, departmentId) {
  return request(`/users/${id}/department`, {
    method: 'PATCH',
    body: { department_id: departmentId },
  })
}
