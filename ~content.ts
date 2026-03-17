import type { ErrorPayload, MessageType } from './src/types'

function buildPayload(
  type: ErrorPayload['type'],
  message: string,
  stack: string | null,
  source: string | null,
  line: number | null,
  column: number | null
): ErrorPayload {
  return {
    id: crypto.randomUUID(),
    type,
    message,
    stack,
    source,
    line,
    column,
    timestamp: Date.now(),
    pageUrl: window.location.href,
    framework: detectedFramework,
  }
}

function isExtensionValid(): boolean {
  try {
    // This throws synchronously if context is invalidated
    return !!chrome.runtime?.id
  } catch {
    return false
  }
}

function sendToBackground(payload: ErrorPayload) {
  if (!isExtensionValid()) {
    // Extension was reloaded — this content script is a zombie, bail silently
    return
  }

  const msg: MessageType = { kind: 'ERROR_CAPTURED', payload }
  chrome.runtime.sendMessage(msg).catch(() => {
    // service worker may be inactive — safe to ignore
  })
}

// JS runtime errors
window.addEventListener('error', (event) => {
  if (!isExtensionValid()) return   // ← add this guard

  const payload = buildPayload(
    'js_error',
    event.message,
    event.error?.stack ?? null,
    event.filename ?? null,
    event.lineno ?? null,
    event.colno ?? null
  )
  sendToBackground(payload)
})

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (!isExtensionValid()) return   // ← add this guard

  const reason = event.reason
  const message = reason instanceof Error ? reason.message : String(reason)
  const stack = reason instanceof Error ? reason.stack ?? null : null

  const payload = buildPayload('promise_rejection', message, stack, null, null, null)
  sendToBackground(payload)
})

// Add this function before the event listeners
function detectFramework(): string | null {
  // React
  if ('__REACT_DEVTOOLS_GLOBAL_HOOK__' in window) return 'React'

  // Vue
  if ('__VUE__' in window || '__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) return 'Vue'

  // Angular
  if ('getAllAngularRootElements' in window) return 'Angular'

  // Svelte (checks for Svelte-specific HMR hooks)
  if ('__svelte' in window) return 'Svelte'

  // Next.js (React-based but worth differentiating)
  if ('__NEXT_DATA__' in window) return 'Next.js'

  // Nuxt (Vue-based)
  if ('__NUXT__' in window) return 'Nuxt'

  return null
}

const detectedFramework = detectFramework()