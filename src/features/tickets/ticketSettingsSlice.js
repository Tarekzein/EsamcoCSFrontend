import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import {
  createSlaPolicy,
  createTicketCategory,
  deleteSlaPolicy,
  deleteTicketCategory,
  fetchSlaPolicies,
  fetchTicketCategories,
  updateSlaPolicy,
  updateTicketCategory,
} from './ticketsAPI'

export const loadSlaPolicies = createAsyncThunk('ticketSettings/loadSlaPolicies', async () => {
  const payload = await fetchSlaPolicies()

  return payload.data
})

export const addSlaPolicy = createAsyncThunk('ticketSettings/addSlaPolicy', async (data) => {
  const payload = await createSlaPolicy(data)

  return payload.data
})

export const editSlaPolicy = createAsyncThunk('ticketSettings/editSlaPolicy', async ({ id, data }) => {
  const payload = await updateSlaPolicy(id, data)

  return payload.data
})

export const removeSlaPolicy = createAsyncThunk('ticketSettings/removeSlaPolicy', async (id) => {
  await deleteSlaPolicy(id)

  return id
})

export const loadCategories = createAsyncThunk('ticketSettings/loadCategories', async () => {
  const payload = await fetchTicketCategories()

  return payload.data
})

export const addCategory = createAsyncThunk('ticketSettings/addCategory', async (data) => {
  const payload = await createTicketCategory(data)

  return payload.data
})

export const editCategory = createAsyncThunk('ticketSettings/editCategory', async ({ id, data }) => {
  const payload = await updateTicketCategory(id, data)

  return payload.data
})

export const removeCategory = createAsyncThunk('ticketSettings/removeCategory', async (id) => {
  await deleteTicketCategory(id)

  return id
})

const initialState = {
  policies: [],
  policiesStatus: 'idle',
  categories: [],
  categoriesStatus: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
}

const ticketSettingsSlice = createSlice({
  name: 'ticketSettings',
  initialState,
  reducers: {
    ticketSettingsErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSlaPolicies.pending, (state) => {
        state.policiesStatus = 'loading'
        state.error = null
      })
      .addCase(loadSlaPolicies.fulfilled, (state, action) => {
        state.policiesStatus = 'succeeded'
        state.policies = action.payload
      })
      .addCase(loadSlaPolicies.rejected, (state, action) => {
        state.policiesStatus = 'failed'
        state.error = action.error.message || 'تعذر تحميل سياسات SLA.'
      })

      .addCase(loadCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed'
        state.error = action.error.message || 'تعذر تحميل الفئات.'
      })

      .addCase(addSlaPolicy.fulfilled, (state, action) => {
        state.policies.push(action.payload)
      })
      .addCase(editSlaPolicy.fulfilled, (state, action) => {
        const index = state.policies.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.policies[index] = action.payload
      })
      .addCase(removeSlaPolicy.fulfilled, (state, action) => {
        state.policies = state.policies.filter((item) => item.id !== action.payload)
      })

      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload)
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.categories[index] = action.payload
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((item) => item.id !== action.payload)
      })

      .addMatcher(
        isAnyOf(
          addSlaPolicy.pending,
          editSlaPolicy.pending,
          removeSlaPolicy.pending,
          addCategory.pending,
          editCategory.pending,
          removeCategory.pending
        ),
        (state) => {
          state.actionStatus = 'loading'
          state.actionError = null
        }
      )
      .addMatcher(
        isAnyOf(
          addSlaPolicy.fulfilled,
          editSlaPolicy.fulfilled,
          removeSlaPolicy.fulfilled,
          addCategory.fulfilled,
          editCategory.fulfilled,
          removeCategory.fulfilled
        ),
        (state) => {
          state.actionStatus = 'succeeded'
        }
      )
      .addMatcher(
        isAnyOf(
          addSlaPolicy.rejected,
          editSlaPolicy.rejected,
          removeSlaPolicy.rejected,
          addCategory.rejected,
          editCategory.rejected,
          removeCategory.rejected
        ),
        (state, action) => {
          state.actionStatus = 'failed'
          state.actionError = action.error.message || 'تعذر حفظ الإعدادات.'
        }
      )
  },
})

export const { ticketSettingsErrorCleared } = ticketSettingsSlice.actions
export default ticketSettingsSlice.reducer
