import { request } from '../../lib/httpClient'

export async function fetchCalls({ page = 1 } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)

  return request(`/telephony/calls?${params.toString()}`)
}

export async function fetchCall(id) {
  return request(`/telephony/calls/${id}`)
}

export async function clickToCall(data) {
  return request('/telephony/calls/click-to-call', { method: 'POST', body: data })
}
