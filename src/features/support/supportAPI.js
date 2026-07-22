const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function publicRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const validationMessage = payload?.errors ? Object.values(payload.errors).flat()[0] : null
    throw new Error(validationMessage || payload?.message || 'تعذر إكمال الطلب. حاول مرة أخرى.')
  }

  return payload
}

export async function fetchSupportDepartments() {
  return publicRequest('/public/live-chat/chatbot/departments')
}

export async function createSupportTicket(values, attachments) {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) formData.append(key, value)
  })
  attachments.forEach((file) => formData.append('attachments[]', file))

  return publicRequest('/public/support/tickets', { method: 'POST', body: formData })
}

export async function requestSupportAccessLink(ticketNumber, email) {
  return publicRequest('/public/support/access-links', {
    method: 'POST',
    body: { ticket_number: ticketNumber, email },
  })
}

export async function fetchPublicTicket(uuid, token) {
  return publicRequest(`/public/support/tickets/${uuid}`, {
    headers: { Authorization: `TicketToken ${token}` },
  })
}

export async function createPublicReply(uuid, token, body, attachments) {
  const formData = new FormData()
  formData.append('body', body)
  attachments.forEach((file) => formData.append('attachments[]', file))

  return publicRequest(`/public/support/tickets/${uuid}/replies`, {
    method: 'POST',
    body: formData,
    headers: { Authorization: `TicketToken ${token}` },
  })
}

export async function downloadPublicAttachment(path, token, filename) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `TicketToken ${token}` },
  })

  if (!response.ok) throw new Error('تعذر تنزيل المرفق.')

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
