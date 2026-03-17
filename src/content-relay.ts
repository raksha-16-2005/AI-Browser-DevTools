// Runs in ISOLATED world — has chrome.runtime access
// Listens for postMessage from content-main.ts and relays to background

console.log('[AI DevTools] Content script (ISOLATED) loaded')

let extensionValid = false

// Check extension validity once at startup
try {
  if (chrome?.runtime?.id) {
    extensionValid = true
    console.log('[AI DevTools Relay] Extension context verified:', chrome.runtime.id)
  }
} catch (e) {
  console.warn('[AI DevTools Relay] Extension context not available at startup')
}

window.addEventListener('message', (event) => {
  // Only handle our namespaced messages from the main world
  if (event.source !== window)           return
  if (!event.data?.__AI_DEVTOOLS__)      return

  if (!extensionValid) {
    // Try to validate again if it failed before
    try {
      if (chrome?.runtime?.id) {
        extensionValid = true
        console.log('[AI DevTools Relay] Extension context now available')
      } else {
        console.warn('[AI DevTools Relay] Extension context still invalid')
        return
      }
    } catch (err) {
      console.warn('[AI DevTools Relay] Failed to validate extension:', err)
      return
    }
  }

  const data = event.data
  console.log('[AI DevTools Relay] Relaying error to background:', data.message)

  // Use promise-based sendMessage with proper error handling
  chrome.runtime.sendMessage({
    kind: 'ERROR_CAPTURED',
    payload: {
      id: crypto.randomUUID(),
      type:      data.type,
      message:   data.message,
      stack:     data.stack,
      source:    data.source,
      line:      data.line,
      column:    data.column,
      timestamp: data.timestamp,
      pageUrl:   data.pageUrl,
      framework: data.framework,
    },
  }).then(() => {
    console.log('[AI DevTools Relay] Error relayed successfully')
  }).catch((error) => {
    console.error('[AI DevTools Relay] Failed to relay error:', error.message)
  })
})