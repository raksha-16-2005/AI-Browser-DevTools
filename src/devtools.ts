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

// Self-healing port connection
let port: chrome.runtime.Port | null = null

function connect() {
  try {
    port = chrome.runtime.connect({ name: 'devtools-panel' })
    console.log('[AI DevTools] Port opened')

    port.onDisconnect.addListener(() => {
      console.log('[AI DevTools] Port dropped — reconnecting in 500ms')
      port = null
      setTimeout(connect, 500)
    })
  } catch (err) {
    console.error('[AI DevTools] connect() failed:', err)
    setTimeout(connect, 500)
  }
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