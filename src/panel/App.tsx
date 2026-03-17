import { useEffect, useRef, useState } from 'react'
import { usePanelPort } from './usePanelPort'
import { Header } from './components/Header'
import { ErrorFeed } from './components/ErrorFeed'
import { SettingsDrawer } from './components/SettingsDrawer'
import type { ErrorPayload, MessageType } from '../types'

export default function App() {
  const {
  errors, connected, sendMessage,
  aiStates, initAiState, keyboardTriggeredId
} = usePanelPort()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const nowRef = useRef<number | null>(null)
  // eslint-disable-next-line react-hooks/refs
  const [now, setNow] = useState<number>(() => nowRef.current ?? Date.now())

  // Derive the active selection — keyboard trigger acts as a fallback
    // No useEffect needed, no state sync, no cascading renders
    const activeId = selectedId ?? keyboardTriggeredId

  // Update it periodically without triggering renders
    useEffect(() => {
    // read the ref outside of render and update state once (or subscribe here if needed)
    setNow(nowRef.current ?? Date.now())

    // Optional: if you want a live clock, uncomment the interval:
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-select when keyboard shortcut fires
    useEffect(() => {
    if (keyboardTriggeredId) {
        setSelectedId(keyboardTriggeredId)
    }
    }, [keyboardTriggeredId])

  function handleExplain(err: ErrorPayload) {
    setSelectedId(err.id)        // explicit click always wins
    initAiState(err.id)
    sendMessage({ kind: 'AI_REQUEST', errorId: err.id, payload: err } satisfies MessageType)
    }

  function handleClear() {
    chrome.storage.session.set({ errors: [] })
    window.location.reload()
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        connected={connected}
        errorCount={errors.length}
        errors={errors}
        now={now}
        onSettings={() => setShowSettings(s => !s)}
        onClear={handleClear}
      />

      {showSettings && (
        <SettingsDrawer onClose={() => setShowSettings(false)} />
      )}

      <ErrorFeed
        errors={errors}
        aiStates={aiStates}
        selectedId={activeId}        // ← was selectedId
        onExplain={handleExplain}
        onSelect={setSelectedId}
      />
    </div>
  )
}