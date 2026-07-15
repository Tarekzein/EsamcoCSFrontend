import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchAuditLog, fetchAuditLogs } from './auditLogsAPI'

export const loadAuditLogs = createAsyncThunk('auditLogs/loadAuditLogs', async (params = {}) => {
  return await fetchAuditLogs(params)
})

export const loadAuditLog = createAsyncThunk('auditLogs/loadAuditLog', async (id) => {
  const payload = await fetchAuditLog(id)

  return payload.data
})

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  selected: null,
  selectedStatus: 'idle',
  selectedError: null,
  filters: {},
}

const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    auditLogFiltersChanged(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    auditLogSelectionCleared(state) {
      state.selected = null
      state.selectedError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuditLogs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadAuditLogs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadAuditLogs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل سجلات التدقيق.'
      })
      .addCase(loadAuditLog.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedError = null
      })
      .addCase(loadAuditLog.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(loadAuditLog.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.selectedError = action.error.message || 'تعذر تحميل تفاصيل السجل.'
      })
  },
})

export const { auditLogFiltersChanged, auditLogSelectionCleared } = auditLogsSlice.actions
export default auditLogsSlice.reducer
