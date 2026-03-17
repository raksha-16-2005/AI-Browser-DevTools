/// <reference types="chrome" />

chrome.devtools.panels.create(
  'AI DevTools',
  '/public/icon32.png',
  '/public/panel.html',
  (panel) => {
    console.log('[AI DevTools] Panel registered')

    // Log when user navigates to/from the AI DevTools tab
    // Do NOT call sidePanel.open() here — setPanelBehavior handles it
    panel.onShown.addListener(() => {
      console.log('[AI DevTools] Panel shown for tab', chrome.devtools.inspectedWindow.tabId)
    })

    panel.onHidden.addListener(() => {
      console.log('[AI DevTools] Panel hidden')
    })
  }
)

// Self-healing port connection with exponential backoff
let port: chrome.runtime.Port | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

function connect() {
  try {
    port = chrome.runtime.connect({ name: 'devtools-panel' })
    console.log('[AI DevTools] Port opened')
    reconnectAttempts = 0

    // Send heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (!port) {
        clearInterval(heartbeatInterval)
        return
      }
      try {
        port.postMessage({ kind: 'HEARTBEAT' })
      } catch (err) {
        console.warn('[AI DevTools] Heartbeat failed:', err)
        clearInterval(heartbeatInterval)
      }
    }, 5000)

    port.onDisconnect.addListener(() => {
      clearInterval(heartbeatInterval)
      console.log('[AI DevTools] Port dropped — reconnecting...')
      port = null
      scheduleReconnect()
    })
  } catch (err) {
    console.error('[AI DevTools] connect() failed:', err)
    scheduleReconnect()
  }
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[AI DevTools] Max reconnection attempts reached')
    return
  }
  
  const delay = Math.min(500 * Math.pow(1.5, reconnectAttempts), 10000)
  reconnectAttempts++
  console.log(`[AI DevTools] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)
  setTimeout(connect, delay)
}

connect()

// Network error capture
chrome.devtools.network.onRequestFinished.addListener((request) => {
  const status = request.response.status
  if (status < 400) return

  // Skip non-HTTP requests
  if (!request.request.url.startsWith('http')) return

  request.getContent((body) => {
    chrome.runtime.sendMessage({
      kind: 'ERROR_CAPTURED',
      payload: {
        id: crypto.randomUUID(),
        type: 'network_error',
        message: `${request.request.method} ${status} — ${request.request.url}`,
        stack: body ? body.slice(0, 500) : null,
        source: request.request.url,
        line: null,
        column: null,
        timestamp: Date.now(),
        pageUrl: String(chrome.devtools.inspectedWindow.tabId),
      },
    }).catch(() => {})
  })
})