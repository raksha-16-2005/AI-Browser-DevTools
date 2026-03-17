import { useState } from 'react'

interface Props {
  label: string
  content: string
  accent: string       // CSS color var name
  defaultOpen?: boolean
}

export function SectionBlock({ label, content, accent, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      marginBottom: '6px',
    }}>
      {/* Section header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'var(--bg-raised)',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: accent,
          flexShrink: 0,
        }}/>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          fontWeight: 600,
          color: accent,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); copy() }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '10px',
            color: copied ? 'var(--green-text)' : 'var(--text-muted)',
            padding: '0 4px',
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
        <span style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform var(--transition)',
          display: 'inline-block',
        }}>›</span>
      </div>

      {/* Content */}
      {open && (
        <div style={{
          padding: '10px',
          background: 'var(--bg-surface)',
          fontSize: '11px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-ui)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {content}
        </div>
      )}
    </div>
  )
}