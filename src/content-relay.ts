// Runs in ISOLATED world — has chrome.runtime access
// Listens for postMessage from content-main.ts and relays to background

console.log('[AI DevTools] Content script (ISOLATED) loaded')

function isExtensionValid(): boolean {
  try {
    return !!chrome.runtime?.id
  } catch {
    return false
  }
}

window.addEventListener('message', (event) => {
  // Only handle our namespaced messages from the main world
  if (event.source !== window)           return
  if (!event.data?.__AI_DEVTOOLS__)      return

  if (!isExtensionValid()) {
    console.log('[AI DevTools Relay] Extension not valid')
    return
  }

  const data = event.data
  console.log('[AI DevTools Relay] Relaying error to background:', data.message)

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
  }).catch(() => {
    // Service worker inactive — safe to ignore
  })
})