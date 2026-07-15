import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import {
  fetchCurrentUser,
  forgotPassword,
  login,
  logout,
  resetPassword,
  updateOwnOnlineStatus,
  verifyResetOtp,
} from './authAPI'

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

// Refreshes the cached user (e.g. picking up fields like department_id
// added to the API after the user's last login) without requiring them
// to log out and back in.
export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async () => {
  const payload = await fetchCurrentUser()

  return payload.data
})

export const toggleOnlineStatus = createAsyncThunk('auth/toggleOnlineStatus', async (isOnline) => {
  const payload = await updateOwnOnlineStatus(isOnline)

  return payload.data
})

// Always clears the local session, even if the request fails (e.g. the
// token already expired or the network is down) - otherwise the user
// would be stuck unable to log out.
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await logout()
  } catch {
    // Best-effort - the backend marks the user offline and revokes the
    // token; local logout still proceeds below regardless of outcome.
  }
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
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
      .addCase(toggleOnlineStatus.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
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

export default authSlice.reducer
