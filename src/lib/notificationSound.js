let audioContext = null

// A context can be closed by the browser after a long idle period (e.g. a
// backgrounded tab) - once closed it can never be resumed, so the cached
// reference has to be discarded and a fresh one created.
function getAudioContext() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function scheduleChime(context) {
  const now = context.currentTime
  ;[880, 1320].forEach((frequency, index) => {
    const start = now + index * 0.1
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(0.15, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25)

    oscillator.start(start)
    oscillator.stop(start + 0.25)
  })
}

// Short synthesized two-note chime - no audio asset needed. Lazily creates
// a single AudioContext, reused across calls. Browsers can leave it (or put
// it back) in a "suspended" state, so resume() is called before scheduling
// tones whenever needed - with a .catch() so a rejected resume() (e.g. the
// context died and couldn't be resumed) doesn't surface as an unhandled
// promise rejection, and instead drops the cached context so the next call
// starts fresh via getAudioContext().
export function playNotificationSound() {
  try {
    const context = getAudioContext()

    if (context.state === 'suspended') {
      context
        .resume()
        .then(() => scheduleChime(context))
        .catch(() => {
          audioContext = null
        })
    } else {
      scheduleChime(context)
    }
  } catch {
    // Audio unsupported/blocked - a missed beep is non-critical.
  }
}
