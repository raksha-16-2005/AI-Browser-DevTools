import type { ErrorPayload, MessageType } from './types'
import { explainError } from './ai/gemini'

let devtoolsPort: chrome.runtime.Port | null = null

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'devtools-panel') return

  devtoolsPort = port
  console.log('[AI DevTools] Panel port connected')

  loadStoredErrors().then((errors) => {
    if (errors.length > 0) {
      port.postMessage({ kind: 'ERRORS_FETCHED', errors } satisfies MessageType)
    }
  })

  port.onMessage.addListener((msg: MessageType) => {
    if (msg.kind === 'PANEL_READY') {
      loadStoredErrors().then((errors) => {
        port.postMessage({ kind: 'ERRORS_FETCHED', errors } satisfies MessageType)
      })
    }
    if (msg.kind === 'AI_REQUEST') {
      handleAIRequest(msg.errorId, msg.payload, port)
    }
  })

  port.onDisconnect.addListener(() => {
    if (devtoolsPort === port) devtoolsPort = null
    console.log('[AI DevTools] Panel port disconnected')
  })
})

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'explain-last-error') return

  const errors = await loadStoredErrors()
  if (errors.length === 0) return

  const latest = errors[0]
  console.log('[AI DevTools] Keyboard shortcut — explaining:', latest.message)

  // Forward the AI request via port if panel is open
  if (devtoolsPort) {
    devtoolsPort.postMessage({
      kind: 'AI_REQUEST',
      errorId: latest.id,
      payload: latest,
    } satisfies MessageType)
  }
})

async function handleAIRequest(
  errorId: string,
  payload: ErrorPayload,
  port: chrome.runtime.Port
) {
  const result = await chrome.storage.local.get('gemini_api_key') as { gemini_api_key?: string }
  const apiKey: string = (result.gemini_api_key ?? '').trim()

  if (!apiKey) {
    port.postMessage({
      kind: 'AI_ERROR',
      errorId,
      message: 'No API key set. Open settings and add your Gemini API key.',
    } satisfies MessageType)
    return
  }

  await explainError(
    payload,
    apiKey,
    (chunk) => {
      try { port.postMessage({ kind: 'AI_CHUNK', errorId, chunk } satisfies MessageType) }
      catch { /* port closed */ }
    },
    (explanation) => {
      try { port.postMessage({ kind: 'AI_DONE', errorId, explanation } satisfies MessageType) }
      catch { /* port closed */ }
    },
    (message) => {
      try { port.postMessage({ kind: 'AI_ERROR', errorId, message } satisfies MessageType) }
      catch { /* port closed */ }
    }
  )
}

chrome.runtime.onMessage.addListener((msg: MessageType, _sender, sendResponse) => {
  // Only handle ERROR_CAPTURED — never call sidePanel.open() here
  if (msg.kind !== 'ERROR_CAPTURED') return true

  const payload = msg.payload
  console.log('[AI DevTools] Error captured:', payload.message)

  storeError(payload).then(() => {
    if (devtoolsPort) {
      try {
        devtoolsPort.postMessage({ kind: 'ERROR_CAPTURED', payload } satisfies MessageType)
      } catch { devtoolsPort = null }
    }
    sendResponse({ ok: true })
  })

  return true
})

async function loadStoredErrors(): Promise<ErrorPayload[]> {
  const result = await chrome.storage.session.get('errors')
  return (result.errors as ErrorPayload[]) ?? []
}

async function storeError(payload: ErrorPayload) {
  const existing = await loadStoredErrors()
  const updated = [payload, ...existing].slice(0, 50)
  await chrome.storage.session.set({ errors: updated })
}

// This alone handles toolbar icon click — no onClicked needed alongside it
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AI DevTools] Extension installed')
})