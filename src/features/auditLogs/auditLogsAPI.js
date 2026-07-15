import { request } from '../../lib/httpClient'

export async function fetchAuditLogs({ page = 1, perPage = 15, departmentId, userId, action, auditableType, email, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)
  if (departmentId) params.set('department_id', departmentId)
  if (userId) params.set('user_id', userId)
  if (action) params.set('action', action)
  if (auditableType) params.set('auditable_type', auditableType)
  if (email) params.set('email', email)
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo) params.set('date_to', dateTo)

  return request(`/audit-logs?${params.toString()}`)
}

export async function fetchAuditLog(id) {
  return request(`/audit-logs/${id}`)
}
