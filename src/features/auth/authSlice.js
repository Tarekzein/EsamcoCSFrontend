import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { forgotPassword, login, resetPassword, verifyResetOtp } from './authAPI'

function getStoredUser() {
  const storedUser = localStorage.getItem('auth_user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('auth_user')

    return null
  }
}

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('auth_token'),
  resetEmail: sessionStorage.getItem('reset_email') || '',
  resetVerified: sessionStorage.getItem('reset_verified') === 'true',
  otpExpiresAt: Number(sessionStorage.getItem('reset_otp_expires_at')) || null,
  status: 'idle',
  error: null,
}

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials) => {
  const payload = await login(credentials)

  return payload.data
})

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (email) => {
  const payload = await forgotPassword(email)

  return { email, expiresInMinutes: payload.data.expires_in_minutes }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otp) => {
  await verifyResetOtp(otp)
})

export const submitNewPassword = createAsyncThunk('auth/submitNewPassword', async (form) => {
  await resetPassword(form)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut(state) {
      state.user = null
      state.token = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.resetEmail = action.payload.email
        state.resetVerified = false
        state.otpExpiresAt = Date.now() + action.payload.expiresInMinutes * 60_000
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.resetVerified = true
      })
      .addCase(submitNewPassword.fulfilled, (state) => {
        state.resetEmail = ''
        state.resetVerified = false
        state.otpExpiresAt = null
      })
      .addMatcher(
        isAnyOf(loginUser.pending, requestPasswordReset.pending, verifyOtp.pending, submitNewPassword.pending),
        (state) => {
          state.status = 'loading'
          state.error = null
        }
      )
      .addMatcher(
        isAnyOf(
          loginUser.fulfilled,
          requestPasswordReset.fulfilled,
          verifyOtp.fulfilled,
          submitNewPassword.fulfilled
        ),
        (state) => {
          state.status = 'succeeded'
        }
      )
      .addMatcher(
        isAnyOf(loginUser.rejected, requestPasswordReset.rejected, verifyOtp.rejected, submitNewPassword.rejected),
        (state, action) => {
          state.status = 'failed'
          state.error = action.error.message
        }
      )
  },
})

export const { loggedOut } = authSlice.actions

export default authSlice.reducer
