import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  assignConversation,
  autoAssignConversation,
  closeConversation,
  convertConversationToTicket,
  deleteConversation,
  deleteMessage,
  fetchConversations,
  fetchMessages,
  markMessagesAsRead,
  reopenConversation,
  sendMessage,
  sendTyping,
  transferConversation as transferConversationAPI,
  uploadAttachment,
} from './liveChatAPI'

function previewTextFor(message) {
  if (message.message_type === 'image') return '📷 صورة'
  if (message.message_type === 'file') return '📄 مستند'
  return message.message
}

function appendMessage(state, conversationId, message) {
  const existing = state.messagesByConversation[conversationId]

  if (existing) {
    if (existing.some((item) => item.id === message.id)) return
    state.messagesByConversation[conversationId] = [...existing, message]
  } else {
    state.messagesByConversation[conversationId] = [message]
  }

  const conversation = state.conversations.find((item) => item.id === conversationId)
  if (conversation) {
    conversation.last_message = previewTextFor(message)
    conversation.updated_at = message.created_at
  }
}

// Replaces the locally-queued optimistic entry (matched by clientId) with
// the server-confirmed message, instead of leaving both in the list.
function reconcileSentMessage(state, conversationId, clientId, realMessage) {
  const messages = state.messagesByConversation[conversationId]

  if (messages) {
    const index = messages.findIndex((item) => item.clientId === clientId)
    if (index !== -1) messages.splice(index, 1)
  }

  appendMessage(state, conversationId, realMessage)
}

// A conversation that just got a new message should jump to the top, like
// any normal chat app - the list otherwise stays frozen in fetch order.
function resortByActivity(state) {
  state.conversations.sort((a, b) => {
    const aTime = new Date(a.updated_at || a.started_at || 0).getTime()
    const bTime = new Date(b.updated_at || b.started_at || 0).getTime()

    return bTime - aTime
  })
}

export const loadConversations = createAsyncThunk('liveChat/loadConversations', async ({ page = 1 } = {}) => {
  const payload = await fetchConversations({ page })

  return { ...payload, page }
})

export const loadMessages = createAsyncThunk(
  'liveChat/loadMessages',
  async (conversationId) => {
    const messages = await fetchMessages(conversationId)

    return { conversationId, messages }
  },
  {
    // Skip the request entirely if this conversation's messages are already cached.
    condition: (conversationId, { getState }) => !(conversationId in getState().liveChat.messagesByConversation),
  }
)

export const sendChatMessage = createAsyncThunk('liveChat/sendChatMessage', async ({ conversationId, message, clientId }) => {
  const sentMessage = await sendMessage({ conversationId, message })

  return { conversationId, message: sentMessage, clientId }
})

export const sendChatAttachment = createAsyncThunk('liveChat/sendChatAttachment', async ({ conversationId, file }) => {
  const sentMessage = await uploadAttachment({ conversationId, file })

  return { conversationId, message: sentMessage }
})

export const sendTypingSignal = createAsyncThunk('liveChat/sendTypingSignal', async ({ conversationId, typing }) => {
  await sendTyping({ conversationId, typing })

  return { conversationId, typing }
})

export const assignConversationToAgent = createAsyncThunk(
  'liveChat/assignConversationToAgent',
  async ({ conversationId, agentId }) => {
    return await assignConversation({ conversationId, agentId })
  }
)

export const closeSelectedConversation = createAsyncThunk(
  'liveChat/closeSelectedConversation',
  async (conversationId) => {
    return await closeConversation(conversationId)
  }
)

export const reopenSelectedConversation = createAsyncThunk(
  'liveChat/reopenSelectedConversation',
  async (conversationId) => {
    return await reopenConversation(conversationId)
  }
)

export const transferConversationToDepartment = createAsyncThunk(
  'liveChat/transferConversationToDepartment',
  async ({ conversationId, departmentId }) => {
    return await transferConversationAPI({ conversationId, departmentId })
  }
)

export const autoAssignSelectedConversation = createAsyncThunk(
  'liveChat/autoAssignSelectedConversation',
  async (conversationId) => {
    return await autoAssignConversation(conversationId)
  }
)

export const convertSelectedConversationToTicket = createAsyncThunk(
  'liveChat/convertSelectedConversationToTicket',
  async (conversationId) => {
    return await convertConversationToTicket(conversationId)
  }
)

export const removeConversation = createAsyncThunk(
  'liveChat/removeConversation',
  async (conversationId) => {
    await deleteConversation(conversationId)

    return conversationId
  }
)

export const removeMessage = createAsyncThunk(
  'liveChat/removeMessage',
  async ({ conversationId, messageId }) => {
    await deleteMessage(messageId)

    return { conversationId, messageId }
  }
)

export const markConversationMessagesAsRead = createAsyncThunk(
  'liveChat/markConversationMessagesAsRead',
  async ({ conversationId, messageIds }) => {
    await markMessagesAsRead(messageIds)

    return { conversationId, messageIds }
  }
)

const initialState = {
  conversations: [],
  conversationsStatus: 'idle',
  conversationsMeta: null,
  selectedId: null,
  messagesByConversation: {},
  messagesStatus: {},
  typingByConversation: {},
  isSending: false,
  conversationActionStatus: 'idle',
  conversationActionError: null,
  conversationActionSuccess: null,
  error: null,
}

// The assign/close/reopen/auto-assign endpoints return a Conversation
// resource that wasn't loaded with `latestMessage`/`unread_count`, so merge
// just the fields they actually touch instead of overwriting the cached
// list entry (which would blank out the preview text and unread badge).
function patchConversation(state, updated) {
  const conversation = state.conversations.find((item) => item.id === updated.id)
  if (!conversation) return

  conversation.status = updated.status
  conversation.assigned_agent = updated.assigned_agent
  conversation.assigned_at = updated.assigned_at
  conversation.closed_at = updated.closed_at
}

const liveChatSlice = createSlice({
  name: 'liveChat',
  initialState,
  reducers: {
    conversationSelected(state, action) {
      state.selectedId = action.payload
      const conversation = state.conversations.find((item) => item.id === action.payload)
      if (conversation) {
        conversation.unread_count = 0
      }
    },
    // Fired by the `conversation.created` Reverb broadcast - a brand-new
    // conversation (auto-assigned or still pending) that isn't in the
    // list yet, so appendMessage's "update an existing conversation"
    // logic alone would never surface it. Also handles a late-arriving
    // duplicate (e.g. a reconnect replay) by updating in place instead of
    // adding a second copy.
    conversationReceived(state, action) {
      const conversation = action.payload
      const index = state.conversations.findIndex((item) => item.id === conversation.id)

      if (index === -1) {
        state.conversations.unshift(conversation)
      } else {
        state.conversations[index] = conversation
      }

      resortByActivity(state)
    },
    // Fired by the `message.sent` Reverb broadcast. Covers both the other
    // party's messages and (if our own X-Socket-ID exclusion didn't apply
    // in time) an echo of our own send, so dedupe by id defensively.
    messageReceived(state, action) {
      const { conversationId, message } = action.payload
      appendMessage(state, conversationId, message)
      resortByActivity(state)

      if (message.sender_type === 'visitor') {
        const conversation = state.conversations.find((item) => item.id === conversationId)
        if (conversation) {
          conversation.unread_count = (conversation.unread_count ?? 0) + 1
        }
      }
    },
    // Optimistic placeholder shown immediately on submit, before the
    // server confirms the send - reconciled/marked failed in
    // sendChatMessage's fulfilled/rejected cases below.
    messageQueued(state, action) {
      const { conversationId, clientId, text } = action.payload

      const queued = {
        id: clientId,
        clientId,
        conversation_id: conversationId,
        sender_type: 'agent',
        message: text,
        message_type: 'text',
        status: 'sending',
        is_read: false,
        created_at: new Date().toISOString(),
      }

      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = []
      }
      state.messagesByConversation[conversationId].push(queued)
    },
    // Flips a failed queued message back to "sending" so the retry link
    // re-uses the same list slot instead of appending a duplicate.
    messageRetrying(state, action) {
      const { conversationId, clientId } = action.payload
      const queued = state.messagesByConversation[conversationId]?.find((item) => item.clientId === clientId)
      if (queued) queued.status = 'sending'
    },
    typingReceived(state, action) {
      const { conversationId, senderType, typing } = action.payload

      if (senderType === 'agent') return

      state.typingByConversation[conversationId] = typing
    },
    messagesRead(state, action) {
      const { conversationId, messageIds } = action.payload
      const messages = state.messagesByConversation[conversationId]

      if (!messages) return

      messages.forEach((message) => {
        if (messageIds.includes(message.id)) {
          message.is_read = true
          message.read_at = message.read_at || new Date().toISOString()
        }
      })
    },
    actionSuccessCleared(state) {
      state.conversationActionSuccess = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConversations.pending, (state) => {
        state.conversationsStatus = 'loading'
        state.error = null
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversationsStatus = 'succeeded'
        const { data, meta, page } = action.payload

        if (page === 1) {
          state.conversations = data
        } else {
          const existingIds = new Set(state.conversations.map((item) => item.id))
          state.conversations.push(...data.filter((item) => !existingIds.has(item.id)))
        }

        state.conversationsMeta = meta
        resortByActivity(state)

        if (!state.selectedId && state.conversations.length > 0) {
          state.selectedId = state.conversations[0].id
        }
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.conversationsStatus = 'failed'
        state.error = action.error.message || 'تعذر تحميل المحادثات.'
      })
      .addCase(loadMessages.pending, (state, action) => {
        state.messagesStatus[action.meta.arg] = 'loading'
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload
        state.messagesByConversation[conversationId] = messages
        state.messagesStatus[conversationId] = 'succeeded'
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.messagesStatus[action.meta.arg] = 'failed'
        state.error = action.error.message || 'تعذر تحميل الرسائل.'
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false
        const { conversationId, clientId, message } = action.payload
        reconcileSentMessage(state, conversationId, clientId, message)
        resortByActivity(state)
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false
        const { conversationId, clientId } = action.meta.arg
        const messages = state.messagesByConversation[conversationId]
        const queued = messages?.find((item) => item.clientId === clientId)
        if (queued) queued.status = 'failed'
        state.error = action.error.message || 'تعذر إرسال الرسالة.'
      })
      .addCase(sendChatAttachment.pending, (state) => {
        state.isSending = true
      })
      .addCase(sendChatAttachment.fulfilled, (state, action) => {
        state.isSending = false
        appendMessage(state, action.payload.conversationId, action.payload.message)
        resortByActivity(state)
      })
      .addCase(sendChatAttachment.rejected, (state, action) => {
        state.isSending = false
        state.error = action.error.message || 'تعذر رفع الملف.'
      })
      .addCase(assignConversationToAgent.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
      })
      .addCase(assignConversationToAgent.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        patchConversation(state, action.payload)
      })
      .addCase(assignConversationToAgent.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر تعيين المحادثة للموظف.'
      })
      .addCase(closeSelectedConversation.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
      })
      .addCase(closeSelectedConversation.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        patchConversation(state, action.payload)
      })
      .addCase(closeSelectedConversation.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر إغلاق المحادثة.'
      })
      .addCase(reopenSelectedConversation.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
      })
      .addCase(reopenSelectedConversation.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        patchConversation(state, action.payload)
      })
      .addCase(reopenSelectedConversation.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر إعادة فتح المحادثة.'
      })
      .addCase(transferConversationToDepartment.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
        state.conversationActionSuccess = null
      })
      .addCase(transferConversationToDepartment.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'

        const transferredId = action.payload.id
        state.conversations = state.conversations.filter((c) => c.id !== transferredId)

        if (state.selectedId === transferredId) {
          state.selectedId = state.conversations.length > 0 ? state.conversations[0].id : null
        }

        state.conversationActionSuccess = 'تم نقل المحادثة بنجاح إلى القسم المحدد.'
      })
      .addCase(transferConversationToDepartment.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر نقل المحادثة إلى قسم آخر.'
      })
      .addCase(autoAssignSelectedConversation.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
      })
      .addCase(autoAssignSelectedConversation.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        patchConversation(state, action.payload)
      })
      .addCase(autoAssignSelectedConversation.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر التوزيع التلقائي للمحادثة.'
      })
      .addCase(convertSelectedConversationToTicket.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
        state.conversationActionSuccess = null
      })
      .addCase(convertSelectedConversationToTicket.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        const ticketLabel = action.payload.ticket_number || `#${action.payload.id}`
        state.conversationActionSuccess = `تم تحويل المحادثة إلى التذكرة ${ticketLabel} بنجاح.`
      })
      .addCase(convertSelectedConversationToTicket.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر تحويل المحادثة إلى تذكرة.'
      })
      .addCase(removeConversation.pending, (state) => {
        state.conversationActionStatus = 'loading'
        state.conversationActionError = null
      })
      .addCase(removeConversation.fulfilled, (state, action) => {
        state.conversationActionStatus = 'succeeded'
        const deletedId = action.payload
        state.conversations = state.conversations.filter((item) => item.id !== deletedId)
        delete state.messagesByConversation[deletedId]
        delete state.messagesStatus[deletedId]

        if (state.selectedId === deletedId) {
          state.selectedId = state.conversations.length > 0 ? state.conversations[0].id : null
        }

        state.conversationActionSuccess = 'تم حذف المحادثة بنجاح.'
      })
      .addCase(removeConversation.rejected, (state, action) => {
        state.conversationActionStatus = 'failed'
        state.conversationActionError = action.error.message || 'تعذر حذف المحادثة.'
      })
      .addCase(removeMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload
        const messages = state.messagesByConversation[conversationId]

        if (messages) {
          state.messagesByConversation[conversationId] = messages.filter((item) => item.id !== messageId)
        }
      })
      .addCase(removeMessage.rejected, (state, action) => {
        state.error = action.error.message || 'تعذر حذف الرسالة.'
      })
      .addCase(markConversationMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId, messageIds } = action.payload

        const conversation = state.conversations.find((item) => item.id === conversationId)
        if (conversation) {
          conversation.unread_count = 0
        }

        const messages = state.messagesByConversation[conversationId]
        if (messages) {
          messages.forEach((message) => {
            if (messageIds.includes(message.id)) {
              message.is_read = true
            }
          })
        }
      })
  },
})

export const {
  conversationSelected,
  conversationReceived,
  messageReceived,
  messageQueued,
  messageRetrying,
  messagesRead,
  typingReceived,
  actionSuccessCleared,
} = liveChatSlice.actions

// Total unread visitor messages across every conversation the frontend
// currently knows about - used for the sidebar badge, which needs a
// number regardless of whether the agent has ever opened Live Chat this
// session.
export const selectLiveChatUnreadTotal = (state) =>
  state.liveChat.conversations.reduce((total, conversation) => total + (conversation.unread_count ?? 0), 0)

export default liveChatSlice.reducer
