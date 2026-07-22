import { getToken, request } from '../../lib/httpClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function downloadTicketMedia(path, filename) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/octet-stream' },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('تعذر تنزيل المرفق.')

  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}

export async function fetchTickets({
  page = 1,
  perPage = 15,
  search,
  status,
  priority,
  departmentId,
  assignedAgentId,
  customerId,
  conversationId,
  unassigned,
  breached,
} = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (priority) params.set('priority', priority)
  if (departmentId) params.set('department_id', departmentId)
  if (assignedAgentId) params.set('assigned_agent_id', assignedAgentId)
  if (customerId) params.set('customer_id', customerId)
  if (conversationId) params.set('conversation_id', conversationId)
  if (unassigned) params.set('unassigned', '1')
  if (breached) params.set('breached', '1')

  return request(`/tickets?${params.toString()}`)
}

export async function fetchTicket(id) {
  return request(`/tickets/${id}`)
}

export async function fetchTicketStats() {
  return request('/tickets/stats')
}

export async function createTicket(data) {
  return request('/tickets', { method: 'POST', body: data })
}

export async function updateTicket(id, data) {
  return request(`/tickets/${id}`, { method: 'PUT', body: data })
}

export async function deleteTicket(id) {
  return request(`/tickets/${id}`, { method: 'DELETE' })
}

/*
|------------------------------------------------------------------
| Lifecycle actions
|------------------------------------------------------------------
*/

export async function claimTicket(id) {
  return request(`/tickets/${id}/claim`, { method: 'POST' })
}

export async function assignTicket(id, agentId) {
  return request(`/tickets/${id}/assign`, { method: 'POST', body: { agent_id: agentId } })
}

export async function escalateTicket(id, reason) {
  return request(`/tickets/${id}/escalate`, { method: 'POST', body: { reason } })
}

export async function resolveTicket(id, resolutionNote) {
  return request(`/tickets/${id}/resolve`, { method: 'POST', body: { resolution_note: resolutionNote } })
}

export async function closeTicket(id) {
  return request(`/tickets/${id}/close`, { method: 'POST' })
}

export async function reopenTicket(id) {
  return request(`/tickets/${id}/reopen`, { method: 'POST' })
}

/*
|------------------------------------------------------------------
| Comments & attachments
|------------------------------------------------------------------
*/

export async function fetchTicketComments(id) {
  return request(`/tickets/${id}/comments`)
}

export async function createTicketComment(id, { body, visibility = 'public', attachments = [] }) {
  const formData = new FormData()
  formData.append('body', body)
  formData.append('visibility', visibility)
  attachments.forEach((file) => formData.append('attachments[]', file))

  return request(`/tickets/${id}/comments`, { method: 'POST', body: formData })
}

export async function attachLiveChat(id, conversationId) {
  return request(`/tickets/${id}/interactions/live-chat`, {
    method: 'POST',
    body: { conversation_id: conversationId },
  })
}

export async function mergeTicket(sourceId, targetTicketId) {
  return request(`/tickets/${sourceId}/merge`, {
    method: 'POST',
    body: { target_ticket_id: targetTicketId },
  })
}

export async function fetchAvailableLiveChats(ticketId, search = '') {
  const params = new URLSearchParams({ per_page: '20' })
  if (search.trim()) params.set('search', search.trim())
  const payload = await request(`/tickets/${ticketId}/available-live-chats?${params.toString()}`)

  return payload.data || []
}

export async function fetchMergeTargets(ticketId, search = '') {
  const params = new URLSearchParams({ per_page: '20' })
  if (search.trim()) params.set('search', search.trim())
  const payload = await request(`/tickets/${ticketId}/merge-targets?${params.toString()}`)

  return payload.data || []
}

export async function uploadTicketAttachment(id, file) {
  // httpClient passes FormData through untouched (no Content-Type) so the
  // browser can set its own multipart boundary.
  const formData = new FormData()
  formData.append('file', file)

  return request(`/tickets/${id}/attachments`, { method: 'POST', body: formData })
}

export async function deleteTicketAttachment(id, mediaId) {
  return request(`/tickets/${id}/attachments/${mediaId}`, { method: 'DELETE' })
}

/*
|------------------------------------------------------------------
| Categories & SLA policies (admin config)
|------------------------------------------------------------------
*/

export async function fetchTicketCategories() {
  return request('/ticket-categories')
}

export async function createTicketCategory(data) {
  return request('/ticket-categories', { method: 'POST', body: data })
}

export async function updateTicketCategory(id, data) {
  return request(`/ticket-categories/${id}`, { method: 'PUT', body: data })
}

export async function deleteTicketCategory(id) {
  return request(`/ticket-categories/${id}`, { method: 'DELETE' })
}

export async function fetchSlaPolicies() {
  return request('/sla-policies')
}

export async function createSlaPolicy(data) {
  return request('/sla-policies', { method: 'POST', body: data })
}

export async function updateSlaPolicy(id, data) {
  return request(`/sla-policies/${id}`, { method: 'PUT', body: data })
}

export async function deleteSlaPolicy(id) {
  return request(`/sla-policies/${id}`, { method: 'DELETE' })
}
