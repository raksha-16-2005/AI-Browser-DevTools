import type { GroupedError } from "../../types"
import { ErrorSparkline } from "./ErrorSparkLine"

interface Props {
  connected: boolean
  errorCount: number
  onSettings: () => void
  onClear: () => void
  errors: GroupedError[]
  now: number 
}

export function Header({ connected, errorCount, onSettings, onClear, errors, now }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
    }}>
      {/* Title */}
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '0.05em',
      }}>
        AI DevTools
      </span>

      {/* Connection badge */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '99px',
        background: connected ? 'var(--green-bg)' : 'var(--red-bg)',
        border: `1px solid ${connected ? 'var(--green-border)' : 'var(--red-border)'}`,
        fontSize: '10px',
        color: connected ? 'var(--green-text)' : 'var(--red-text)',
      }}>
        <span style={{
          width: '5px', height: '5px',
          borderRadius: '50%',
          background: connected ? 'var(--green-text)' : 'var(--red-text)',
          animation: connected ? 'pulse 2s infinite' : 'none',
        }}/>
        {connected ? 'live' : 'offline'}
      </span>

      {/* Error count badge */}
      {errorCount > 0 && (
        <span style={{
          padding: '2px 6px',
          borderRadius: '99px',
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          fontSize: '10px',
          color: 'var(--red-text)',
          fontFamily: 'var(--font-ui)',
        }}>
          {errorCount} error{errorCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <ErrorSparkline errors={errors} now={now} />
        <div style={{ flex: 1 }} />

      {/* Clear button */}
      {errorCount > 0 && (
        <button onClick={onClear} style={ghostBtn}>
          Clear
        </button>
      )}

      {/* Settings button */}
      <button onClick={onSettings} style={ghostBtn}>
        Settings
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-secondary)',
  fontSize: '11px',
  padding: '2px 8px',
  cursor: 'pointer',
  transition: 'var(--transition)',
}