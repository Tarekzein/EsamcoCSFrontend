import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import {
  assignTicket,
  attachLiveChat,
  claimTicket,
  closeTicket,
  createTicket,
  createTicketComment,
  deleteTicket,
  deleteTicketAttachment,
  escalateTicket,
  fetchTicket,
  fetchTicketCategories,
  fetchTicketComments,
  fetchTickets,
  fetchTicketStats,
  mergeTicket,
  reopenTicket,
  resolveTicket,
  updateTicket,
  uploadTicketAttachment,
} from './ticketsAPI'

export const loadTickets = createAsyncThunk('tickets/loadTickets', async (params = {}) => {
  return await fetchTickets(params)
})

export const loadTicket = createAsyncThunk('tickets/loadTicket', async (id) => {
  const payload = await fetchTicket(id)

  return payload.data
})

export const loadTicketStats = createAsyncThunk('tickets/loadTicketStats', async () => {
  const payload = await fetchTicketStats()

  return payload.data
})

export const loadTicketCategories = createAsyncThunk('tickets/loadTicketCategories', async () => {
  const payload = await fetchTicketCategories()

  return payload.data
})

export const addTicket = createAsyncThunk('tickets/addTicket', async (data) => {
  const payload = await createTicket(data)

  return payload.data
})

export const editTicket = createAsyncThunk('tickets/editTicket', async ({ id, data }) => {
  const payload = await updateTicket(id, data)

  return payload.data
})

export const removeTicket = createAsyncThunk('tickets/removeTicket', async (id) => {
  await deleteTicket(id)

  return id
})

export const claimSelectedTicket = createAsyncThunk('tickets/claimTicket', async (id) => {
  const payload = await claimTicket(id)

  return payload.data
})

export const assignSelectedTicket = createAsyncThunk('tickets/assignTicket', async ({ id, agentId }) => {
  const payload = await assignTicket(id, agentId)

  return payload.data
})

export const escalateSelectedTicket = createAsyncThunk('tickets/escalateTicket', async ({ id, reason }) => {
  const payload = await escalateTicket(id, reason)

  return payload.data
})

export const resolveSelectedTicket = createAsyncThunk('tickets/resolveTicket', async ({ id, resolutionNote }) => {
  const payload = await resolveTicket(id, resolutionNote)

  return payload.data
})

export const closeSelectedTicket = createAsyncThunk('tickets/closeTicket', async (id) => {
  const payload = await closeTicket(id)

  return payload.data
})

export const reopenSelectedTicket = createAsyncThunk('tickets/reopenTicket', async (id) => {
  const payload = await reopenTicket(id)

  return payload.data
})

export const loadTicketComments = createAsyncThunk('tickets/loadTicketComments', async (id) => {
  const payload = await fetchTicketComments(id)

  return payload.data
})

export const addTicketComment = createAsyncThunk('tickets/addTicketComment', async ({ id, body, visibility, attachments }) => {
  const payload = await createTicketComment(id, { body, visibility, attachments })

  return payload.data
})

export const attachTicketLiveChat = createAsyncThunk('tickets/attachLiveChat', async ({ id, conversationId }, { dispatch }) => {
  await attachLiveChat(id, conversationId)

  return dispatch(loadTicket(id)).unwrap()
})

export const mergeSelectedTicket = createAsyncThunk('tickets/mergeTicket', async ({ sourceId, targetTicketId }) => {
  const payload = await mergeTicket(sourceId, targetTicketId)

  return payload.data
})

// Attachments re-fetch the whole ticket rather than trusting the upload
// response: the API only includes `attachments` on GET /tickets/{id}, so the
// upload/delete responses can't be merged into state directly.
export const addTicketAttachment = createAsyncThunk('tickets/addTicketAttachment', async ({ id, file }, { dispatch }) => {
  await uploadTicketAttachment(id, file)

  return dispatch(loadTicket(id)).unwrap()
})

export const removeTicketAttachment = createAsyncThunk('tickets/removeTicketAttachment', async ({ id, mediaId }, { dispatch }) => {
  await deleteTicketAttachment(id, mediaId)

  return dispatch(loadTicket(id)).unwrap()
})

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
  actionSuccess: null,
  selected: null,
  selectedStatus: 'idle',
  comments: [],
  commentsStatus: 'idle',
  categories: [],
  categoriesStatus: 'idle',
  stats: null,
  statsStatus: 'idle',
}

/**
 * Merge a ticket payload into `selected` without losing fields the payload
 * simply doesn't carry.
 *
 * `attachments` is the reason this exists: it's a whenLoaded('media')
 * field the API only returns from GET /tickets/{id}. Every lifecycle action
 * (claim/resolve/close/...) returns a ticket *without* it, so a naive
 * replace would blank the attachment list on every button press.
 */
function mergeSelected(current, incoming) {
  if (!current || current.id !== incoming.id) return incoming

  return {
    ...current,
    ...incoming,
    attachments: incoming.attachments ?? current.attachments,
  }
}

function upsertIntoList(state, ticket) {
  const index = state.items.findIndex((item) => item.id === ticket.id)

  if (index !== -1) {
    state.items[index] = { ...state.items[index], ...ticket }
  }

  if (state.selected?.id === ticket.id) {
    state.selected = mergeSelected(state.selected, ticket)
  }
}

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    ticketsErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
    actionSuccessCleared(state) {
      state.actionSuccess = null
    },
    ticketSelected(state, action) {
      state.selected = action.payload
      state.selectedStatus = 'succeeded'
    },
    ticketSelectionCleared(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.comments = []
      state.commentsStatus = 'idle'
    },
    // Real-time entry points (see useTicketsChannel).
    ticketUpserted(state, action) {
      upsertIntoList(state, action.payload)
    },
    ticketRemoved(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    ticketCommentAppended(state, action) {
      const comment = action.payload

      if (state.selected?.id === comment.ticket_id && !state.comments.some((item) => item.id === comment.id)) {
        state.comments.push(comment)
      }

      const index = state.items.findIndex((item) => item.id === comment.ticket_id)

      if (index !== -1) {
        state.items[index].comments_count = (state.items[index].comments_count ?? 0) + 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTickets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadTickets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadTickets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل التذاكر.'
      })

      .addCase(loadTicket.pending, (state) => {
        state.selectedStatus = 'loading'
      })
      .addCase(loadTicket.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = mergeSelected(state.selected, action.payload)
      })
      .addCase(loadTicket.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.error = action.error.message || 'تعذر تحميل التذكرة.'
      })

      .addCase(loadTicketStats.pending, (state) => {
        state.statsStatus = 'loading'
      })
      .addCase(loadTicketStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.stats = action.payload
      })
      .addCase(loadTicketStats.rejected, (state) => {
        state.statsStatus = 'failed'
      })

      .addCase(loadTicketCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(loadTicketCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(loadTicketCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })

      .addCase(addTicket.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items.unshift(action.payload)
        state.actionSuccess = `تم إنشاء التذكرة ${action.payload.ticket_number} بنجاح.`
      })

      .addCase(removeTicket.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items = state.items.filter((item) => item.id !== action.payload)

        if (state.selected?.id === action.payload) state.selected = null

        state.actionSuccess = 'تم حذف التذكرة بنجاح.'
      })

      .addCase(loadTicketComments.pending, (state) => {
        state.commentsStatus = 'loading'
      })
      .addCase(loadTicketComments.fulfilled, (state, action) => {
        state.commentsStatus = 'succeeded'
        state.comments = action.payload
      })
      .addCase(loadTicketComments.rejected, (state) => {
        state.commentsStatus = 'failed'
        state.comments = []
      })

      .addCase(addTicketComment.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'

        if (!state.comments.some((item) => item.id === action.payload.id)) {
          state.comments.push(action.payload)
        }

        if (state.selected) {
          state.selected.comments_count = (state.selected.comments_count ?? 0) + 1
        }
      })

      // Every action that returns a fresh ticket funnels through one
      // matcher so the merge rule (and the attachments caveat) lives in a
      // single place.
      .addMatcher(
        isAnyOf(
          editTicket.fulfilled,
          claimSelectedTicket.fulfilled,
          assignSelectedTicket.fulfilled,
          escalateSelectedTicket.fulfilled,
          resolveSelectedTicket.fulfilled,
          closeSelectedTicket.fulfilled,
          reopenSelectedTicket.fulfilled,
          addTicketAttachment.fulfilled,
          removeTicketAttachment.fulfilled,
          attachTicketLiveChat.fulfilled,
          mergeSelectedTicket.fulfilled
        ),
        (state, action) => {
          state.actionStatus = 'succeeded'
          upsertIntoList(state, action.payload)

          if (state.selected?.id === action.payload.id) {
            state.selected = mergeSelected(state.selected, action.payload)
          }
        }
      )
      .addMatcher(
        isAnyOf(
          addTicket.pending,
          editTicket.pending,
          removeTicket.pending,
          claimSelectedTicket.pending,
          assignSelectedTicket.pending,
          escalateSelectedTicket.pending,
          resolveSelectedTicket.pending,
          closeSelectedTicket.pending,
          reopenSelectedTicket.pending,
          addTicketComment.pending,
          addTicketAttachment.pending,
          removeTicketAttachment.pending,
          attachTicketLiveChat.pending,
          mergeSelectedTicket.pending
        ),
        (state) => {
          state.actionStatus = 'loading'
          state.actionError = null
        }
      )
      .addMatcher(
        isAnyOf(
          addTicket.rejected,
          editTicket.rejected,
          removeTicket.rejected,
          claimSelectedTicket.rejected,
          assignSelectedTicket.rejected,
          escalateSelectedTicket.rejected,
          resolveSelectedTicket.rejected,
          closeSelectedTicket.rejected,
          reopenSelectedTicket.rejected,
          addTicketComment.rejected,
          addTicketAttachment.rejected,
          removeTicketAttachment.rejected,
          attachTicketLiveChat.rejected,
          mergeSelectedTicket.rejected
        ),
        (state, action) => {
          state.actionStatus = 'failed'
          state.actionError = action.error.message || 'تعذر تنفيذ العملية.'
        }
      )
  },
})

export const {
  ticketsErrorCleared,
  actionSuccessCleared,
  ticketSelected,
  ticketSelectionCleared,
  ticketUpserted,
  ticketRemoved,
  ticketCommentAppended,
} = ticketsSlice.actions

export default ticketsSlice.reducer
