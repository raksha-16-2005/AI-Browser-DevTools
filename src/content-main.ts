// Runs in MAIN world — can see real page errors
// Cannot use chrome.runtime — uses postMessage to talk to isolated world

console.log('[AI DevTools] Content script (MAIN) loaded')

function buildErrorDetail(
  type: string,
  message: string,
  stack: string | null,
  source: string | null,
  line: number | null,
  column: number | null
) {
  return {
    __AI_DEVTOOLS__: true,   // namespace flag so relay ignores other messages
    type,
    message,
    stack,
    source,
    line,
    column,
    timestamp: Date.now(),
    pageUrl: window.location.href,
    framework: detectFramework(),
  }
}

function detectFramework(): string | null {
  if ('__NEXT_DATA__' in window)                        return 'Next.js'
  if ('__NUXT__' in window)                             return 'Nuxt'
  if ('__REACT_DEVTOOLS_GLOBAL_HOOK__' in window)       return 'React'
  if ('__VUE__' in window)                              return 'Vue'
  if ('getAllAngularRootElements' in window)             return 'Angular'
  if ('__svelte' in window)                             return 'Svelte'
  return null
}

// JS runtime errors
window.addEventListener('error', (event) => {
  const detail = buildErrorDetail(
    'js_error',
    event.message,
    event.error?.stack ?? null,
    event.filename ?? null,
    event.lineno ?? null,
    event.colno ?? null
  )
  console.log('[AI DevTools] JS Error captured:', detail.message)
  window.postMessage(detail, '*')
}, true)   // ← capture phase catches more errors

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const message = reason instanceof Error ? reason.message : String(reason)
  const stack   = reason instanceof Error ? (reason.stack ?? null) : null

  const detail = buildErrorDetail(
    'promise_rejection',
    message,
    stack,
    null,
    null,
    null
  )
  console.log('[AI DevTools] Promise rejection captured:', message)
  window.postMessage(detail, '*')
})