import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getToken } from './httpClient'

window.Pusher = Pusher

let echoInstance = null

function authorizeChannel(channelName, socketId) {
  return fetch('/broadcasting/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
  }).then((response) => {
    if (!response.ok) throw new Error('تعذر التحقق من صلاحية القناة.')

    return response.json()
  })
}

// Reused across the app rather than reconnecting per page - callers should
// disconnectEcho() when the feature that needed it (e.g. LiveChatPage)
// unmounts, so we don't hold an idle socket open on unrelated pages.
export function connectEcho() {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || '9ad6592ed12ea17e8d31b1c607c609cb',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        authorizeChannel(channel.name, socketId)
          .then((data) => callback(null, data))
          .catch((error) => callback(error, null))
      },
    }),
  })

  return echoInstance
}

export function disconnectEcho() {
  echoInstance?.disconnect()
  echoInstance = null
}

export function getSocketId() {
  return echoInstance?.socketId() ?? null
}

// Reverb speaks the Pusher protocol, so the underlying pusher-js
// connection object (not Echo itself) is what exposes connection-state
// events - 'connecting' | 'connected' | 'unavailable' | 'failed' |
// 'disconnected'. Returns an unsubscribe function for cleanup.
export function onConnectionStateChange(callback) {
  const echo = connectEcho()
  const connection = echo.connector.pusher.connection

  callback(connection.state)

  const handleStateChange = ({ current }) => callback(current)
  connection.bind('state_change', handleStateChange)

  return () => connection.unbind('state_change', handleStateChange)
}
