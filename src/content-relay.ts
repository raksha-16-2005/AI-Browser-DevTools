// Runs in ISOLATED world — has chrome.runtime access
// Listens for postMessage from content-main.ts and relays to background

console.log('[AI DevTools] Content script (ISOLATED) loaded')

function isExtensionValid(): boolean {
  try {
    // Check if runtime exists and has the id property
    if (!chrome?.runtime?.id) {
      return false
    }
    return true
  } catch (e) {
    console.warn('[AI DevTools Relay] Extension valid check failed:', e)
    return false
  }
}

window.addEventListener('message', (event) => {
  // Only handle our namespaced messages from the main world
  if (event.source !== window)           return
  if (!event.data?.__AI_DEVTOOLS__)      return

  if (!isExtensionValid()) {
    console.warn('[AI DevTools Relay] Extension context invalid, attempting to reconnect...')
    return
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