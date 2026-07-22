import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clickToCall, fetchCall, fetchCalls } from './telephonyAPI'

export const loadCalls = createAsyncThunk('telephony/loadCalls', async (params = {}) => {
  return await fetchCalls(params)
})

export const loadCall = createAsyncThunk('telephony/loadCall', async (id) => {
  const payload = await fetchCall(id)

  return payload.data
})

export const startClickToCall = createAsyncThunk('telephony/startClickToCall', async (data) => {
  const payload = await clickToCall(data)

  return payload.data
})

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
  selected: null,
  selectedStatus: 'idle',
}

const telephonySlice = createSlice({
  name: 'telephony',
  initialState,
  reducers: {
    telephonyErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
    callSelectionCleared(state) {
      state.selected = null
      state.selectedStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCalls.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCalls.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadCalls.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل المكالمات.'
      })
      .addCase(loadCall.pending, (state) => {
        state.selectedStatus = 'loading'
      })
      .addCase(loadCall.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(loadCall.rejected, (state) => {
        state.selectedStatus = 'failed'
      })
      .addCase(startClickToCall.pending, (state) => {
        state.actionStatus = 'loading'
        state.actionError = null
      })
      .addCase(startClickToCall.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items.unshift(action.payload)
        if (state.meta) state.meta.total += 1
      })
      .addCase(startClickToCall.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.error.message || 'تعذر بدء المكالمة.'
      })
  },
})

export const { telephonyErrorCleared, callSelectionCleared } = telephonySlice.actions
export default telephonySlice.reducer
