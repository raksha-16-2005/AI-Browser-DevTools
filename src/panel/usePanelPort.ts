import { useEffect, useState, useRef } from 'react'
import type { AIExplanation, MessageType, GroupedError } from '../types'

interface AIState {
  status: 'loading' | 'done' | 'error'
  streamText: string
  explanation: AIExplanation | null
  error: string | null
}

export function usePanelPort() {
  const [errors, setErrors]               = useState<GroupedError[]>([])
  const [connected, setConnected]         = useState(false)
  const [aiStates, setAiStates]           = useState<Record<string, AIState>>({})
  const [keyboardTriggeredId, setKeyboardTriggeredId] = useState<string | null>(null)
  const portRef                           = useRef<chrome.runtime.Port | null>(null)

  useEffect(() => {
    let cancelled = false

    function connect() {
      if (cancelled) return
      try {
        const port = chrome.runtime.connect({ name: 'devtools-panel' })
        portRef.current = port
        setConnected(true)
        console.log('[Panel] Connected to background worker')

        port.postMessage({ kind: 'PANEL_READY' } satisfies MessageType)
        console.log('[Panel] Sent PANEL_READY message')

        port.onMessage.addListener((msg: MessageType) => {

          if (msg.kind === 'ERRORS_FETCHED') {
            console.log('[Panel] ERRORS_FETCHED:', msg.errors.length, 'errors')
            setErrors(
              msg.errors.map(e => ({ payload: e, count: 1, firstSeen: e.timestamp }))
            )
          }

          if (msg.kind === 'ERROR_CAPTURED') {
            console.log('[Panel] ERROR_CAPTURED:', msg.payload.message)
            setErrors(prev => {
              const key = `${msg.payload.message}__${msg.payload.source ?? ''}`
              const existingIndex = prev.findIndex(
                g => `${g.payload.message}__${g.payload.source ?? ''}` === key
              )
              if (existingIndex !== -1) {
                const updated = [...prev]
                updated[existingIndex] = {
                  payload: msg.payload,
                  count: updated[existingIndex].count + 1,
                  firstSeen: updated[existingIndex].firstSeen,
                }
                const [item] = updated.splice(existingIndex, 1)
                return [item, ...updated].slice(0, 50)
              }
              return [
                { payload: msg.payload, count: 1, firstSeen: msg.payload.timestamp },
                ...prev,
              ].slice(0, 50)
            })
          }

          if (msg.kind === 'AI_CHUNK') {
            setAiStates(prev => ({
              ...prev,
              [msg.errorId]: {
                ...prev[msg.errorId],
                status: 'loading',
                streamText: (prev[msg.errorId]?.streamText ?? '') + msg.chunk,
              },
            }))
          }

          if (msg.kind === 'AI_DONE') {
            setAiStates(prev => ({
              ...prev,
              [msg.errorId]: {
                status: 'done',
                streamText: prev[msg.errorId]?.streamText ?? '',
                explanation: msg.explanation,
                error: null,
              },
            }))
          }

          if (msg.kind === 'AI_ERROR') {
            setAiStates(prev => ({
              ...prev,
              [msg.errorId]: {
                status: 'error',
                streamText: '',
                explanation: null,
                error: msg.message,
              },
            }))
          }

          // Heartbeat acknowledgement — keeps extension context alive
          if (msg.kind === 'HEARTBEAT_ACK') {
            // Silent ACK — just confirms connection is alive
          }

          // Keyboard shortcut triggered from background
          // Init AI state and signal App.tsx to auto-select this error
          if (msg.kind === 'AI_REQUEST') {
            setAiStates(prev => ({
              ...prev,
              [msg.errorId]: {
                status: 'loading',
                streamText: '',
                explanation: null,
                error: null,
              },
            }))
            setKeyboardTriggeredId(msg.errorId)
          }
        })

        port.onDisconnect.addListener(() => {
          if (cancelled) return
          portRef.current = null
          setConnected(false)
          setTimeout(connect, 500)
        })

      } catch {
        setTimeout(connect, 500)
      }
    }

    connect()
    return () => {
      cancelled = true
      portRef.current?.disconnect()
    }
  }, [])

  function sendMessage(msg: MessageType) {
    try {
      portRef.current?.postMessage(msg)
    } catch (err) {
      console.error('[AI DevTools] sendMessage failed:', err)
    }
  }

  function initAiState(errorId: string) {
    setAiStates(prev => ({
      ...prev,
      [errorId]: { status: 'loading', streamText: '', explanation: null, error: null },
    }))
  }

  return { errors, connected, sendMessage, aiStates, initAiState, keyboardTriggeredId }
}