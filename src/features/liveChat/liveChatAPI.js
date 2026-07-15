import { getSocketId } from '../../lib/echo'
import { request } from '../../lib/httpClient'

export async function fetchConversations({ page = 1, perPage = 50 } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', perPage)

  return request(`/live-chat/conversations?${params.toString()}`)
}

export async function fetchMessages(conversationId) {
  const payload = await request(`/live-chat/conversations/${conversationId}/messages`)

  return payload.data
}

export async function uploadAttachment({ conversationId, file }) {
  const socketId = getSocketId()
  const formData = new FormData()
  formData.append('conversation_id', conversationId)
  formData.append('file', file)

  const payload = await request('/live-chat/messages/attachment', {
    method: 'POST',
    headers: socketId ? { 'X-Socket-ID': socketId } : undefined,
    body: formData,
  })

  return payload.data
}

export async function sendMessage({ conversationId, message }) {
  const socketId = getSocketId()

  const payload = await request('/live-chat/messages', {
    method: 'POST',
    // Lets the backend's broadcast(...)->toOthers() exclude our own
    // connection, so we don't receive our own message back over the socket
    // (messageReceived in liveChatSlice still dedupes by id as a fallback).
    headers: socketId ? { 'X-Socket-ID': socketId } : undefined,
    body: {
      conversation_id: conversationId,
      message,
      message_type: 'text',
    },
  })

  return payload.data
}

export async function sendTyping({ conversationId, typing }) {
  const socketId = getSocketId()

  await request('/live-chat/messages/typing', {
    method: 'POST',
    headers: socketId ? { 'X-Socket-ID': socketId } : undefined,
    body: {
      conversation_id: conversationId,
      typing,
    },
  })
}

export async function assignConversation({ conversationId, agentId }) {
  const payload = await request('/live-chat/conversations/assign', {
    method: 'POST',
    body: { conversation_id: conversationId, agent_id: agentId },
  })

  return payload.data
}

export async function closeConversation(conversationId) {
  const payload = await request('/live-chat/conversations/close', {
    method: 'POST',
    body: { conversation_id: conversationId },
  })

  return payload.data
}

export async function reopenConversation(conversationId) {
  const payload = await request('/live-chat/conversations/reopen', {
    method: 'POST',
    body: { conversation_id: conversationId },
  })

  return payload.data
}

export async function markMessagesAsRead(messageIds) {
  if (!messageIds.length) return

  const socketId = getSocketId()

  await request('/live-chat/messages/read', {
    method: 'POST',
    headers: socketId ? { 'X-Socket-ID': socketId } : undefined,
    body: {
      message_ids: messageIds,
    },
  })
}

export async function transferConversation({ conversationId, departmentId }) {
  const payload = await request('/live-chat/conversations/transfer', {
    method: 'POST',
    body: { conversation_id: conversationId, department_id: departmentId },
  })

  return payload.data
}

export async function autoAssignConversation(conversationId) {
  const payload = await request('/live-chat/conversations/auto-assign', {
    method: 'POST',
    body: { conversation_id: conversationId },
  })

  return payload.data
}

export async function convertConversationToTicket(conversationId) {
  const payload = await request(`/live-chat/conversations/${conversationId}/convert-to-ticket`, {
    method: 'POST',
  })

  return payload.data
}

export async function deleteConversation(conversationId) {
  await request(`/live-chat/conversations/${conversationId}`, { method: 'DELETE' })
}

export async function deleteMessage(messageId) {
  await request(`/live-chat/messages/${messageId}`, { method: 'DELETE' })
}
