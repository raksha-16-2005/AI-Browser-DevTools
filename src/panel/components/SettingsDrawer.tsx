import { useState, useEffect } from 'react'

interface Props { onClose: () => void }

export function SettingsDrawer({ onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    chrome.storage.local.get('gemini_api_key', (r: { gemini_api_key?: string }) => {
      if (r.gemini_api_key) setApiKey(r.gemini_api_key)
    })
  }, [])

  async function save() {
    // Trim whitespace from API key to prevent validation errors
    const trimmedKey = apiKey.trim()
    await chrome.storage.local.set({ gemini_api_key: trimmedKey })
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      padding: '12px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          Settings
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px' }}>
          ×
        </button>
      </div>

      <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Gemini API Key
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="AIza..."
        style={{
          width: '100%',
          padding: '6px 8px',
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          marginBottom: '8px',
          outline: 'none',
        }}
      />
      <button
        onClick={save}
        style={{
          padding: '5px 14px',
          borderRadius: 'var(--radius-sm)',
          background: saved ? 'var(--green-bg)' : 'var(--accent)',
          color: saved ? 'var(--green-text)' : '#fff',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background var(--transition)',
          border: saved ? '1px solid var(--green-border)' : 'none',
        }}
      >
        {saved ? 'Saved ✓' : 'Save key'}
      </button>
    </div>
  )
}