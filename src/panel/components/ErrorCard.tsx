import { useState } from 'react'
import type { ErrorPayload, AIExplanation } from '../../types'
import { ExplanationPanel } from './ExplanationPanel'

interface AIState {
  status: 'loading' | 'done' | 'error'
  streamText: string
  explanation: AIExplanation | null
  error: string | null
}

interface Props {
  error: ErrorPayload
  count: number          // ← add
  firstSeen: number      // ← add
  isSelected: boolean
  aiState?: AIState
  onExplain: (err: ErrorPayload) => void
  onSelect: (id: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  js_error:          'var(--red-text)',
  promise_rejection: 'var(--amber-text)',
  network_error:     'var(--blue-text)',
}

const TYPE_BG: Record<string, string> = {
  js_error:          'var(--red-bg)',
  promise_rejection: 'var(--amber-bg)',
  network_error:     'var(--blue-bg)',
}

const TYPE_BORDER: Record<string, string> = {
  js_error:          'var(--red-border)',
  promise_rejection: 'var(--amber-border)',
  network_error:     'var(--blue-border)',
}

export function ErrorCard({ error, isSelected, aiState, onExplain, onSelect, count }: Props) {
  const color  = TYPE_COLORS[error.type]  ?? 'var(--red-text)'
  const bg     = TYPE_BG[error.type]      ?? 'var(--red-bg)'
  const border = TYPE_BORDER[error.type]  ?? 'var(--red-border)'
  const time   = new Date(error.timestamp).toLocaleTimeString()
  const [issueCopied, setIssueCopied] = useState(false)

  function copyAsGitHubIssue() {
    const lines: string[] = []

    lines.push(`## Bug Report`)
    lines.push(``)
    lines.push(`### Error`)
    lines.push(`\`\`\``)
    lines.push(error.message)
    lines.push(`\`\`\``)
    lines.push(``)
    lines.push(`### Stack Trace`)
    lines.push(`\`\`\``)
    lines.push(error.stack ?? 'No stack trace available')
    lines.push(`\`\`\``)
    lines.push(``)
    lines.push(`### Context`)
    lines.push(`- **Type:** ${error.type}`)
    lines.push(`- **Page:** ${error.pageUrl}`)
    if (error.source) lines.push(`- **Source:** ${error.source}:${error.line ?? '?'}`)
    lines.push(`- **Time:** ${new Date(error.timestamp).toISOString()}`)

    // If AI explanation exists, append it
    if (aiState?.explanation) {
        lines.push(``)
        lines.push(`### AI Analysis`)
        lines.push(`**What:** ${aiState.explanation.what}`)
        lines.push(``)
        lines.push(`**Why:** ${aiState.explanation.why}`)
        lines.push(``)
        lines.push(`**Fix:**`)
        lines.push(aiState.explanation.fix)
    }

    navigator.clipboard.writeText(lines.join('\n'))
    setIssueCopied(true)
    setTimeout(() => setIssueCopied(false), 2000)
    }

  return (
    <div
      onClick={() => onSelect(error.id)}
      style={{
        padding: '10px 12px',
        marginBottom: '4px',
        borderRadius: 'var(--radius-md)',
        background: isSelected ? 'var(--bg-raised)' : 'var(--bg-surface)',
        border: `1px solid ${isSelected ? 'var(--border-light)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'background var(--transition), border-color var(--transition)',
      }}
    >
      {/* Top row — type badge + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <span style={{
          padding: '1px 6px',
          borderRadius: '3px',
          background: bg,
          border: `1px solid ${border}`,
          color,
          fontSize: '10px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          {error.type.replace('_', ' ')}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-ui)', flex: 1 }}>
          {time}
        </span>
        {count > 1 && (
            <span style={{
                padding: '1px 6px',
                borderRadius: '3px',
                background: 'var(--amber-bg)',
                border: '1px solid var(--amber-border)',
                color: 'var(--amber-text)',
                fontSize: '10px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                flexShrink: 0,
            }}>
                ×{count}
            </span>
        )}
        {/* Explain button */}
        <button
          onClick={(e) => { e.stopPropagation(); onExplain(error) }}
          disabled={aiState?.status === 'loading'}
          style={{
            padding: '2px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: aiState?.status === 'loading' ? 'var(--bg-hover)' : 'var(--accent)',
            color: aiState?.status === 'loading' ? 'var(--text-muted)' : '#fff',
            fontSize: '10px',
            fontWeight: 600,
            cursor: aiState?.status === 'loading' ? 'default' : 'pointer',
            transition: 'background var(--transition)',
            flexShrink: 0,
          }}
        >
          {aiState?.status === 'loading' ? '...' : 'Explain'}
        </button>
      </div>

      {/* Error message */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--text-primary)',
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>
        {error.message}
      </div>

      {error.framework && (
        <span style={{
            padding: '1px 6px',
            borderRadius: '3px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '10px',
            fontFamily: 'var(--font-ui)',
            flexShrink: 0,
        }}>
            {error.framework}
        </span>
    )}

      {/* Source */}
      {error.source && (
        <div style={{
          marginTop: '4px',
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {error.source}{error.line != null ? `:${error.line}` : ''}
        </div>
      )}

      {/* AI explanation — only shows when selected */}
      {isSelected && aiState && (
        <ExplanationPanel
          errorId={error.id}
          streamingText={aiState.streamText}
          explanation={aiState.explanation}
          isLoading={aiState.status === 'loading'}
          error={aiState.error}
        />
      )}

      {isSelected && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
            onClick={(e) => { e.stopPropagation(); copyAsGitHubIssue() }}
            style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: issueCopied ? 'var(--green-bg)' : 'transparent',
                color: issueCopied ? 'var(--green-text)' : 'var(--text-muted)',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                fontFamily: 'var(--font-ui)',
            }}
            >
            {issueCopied ? 'Copied!' : 'Copy as GitHub issue'}
            </button>
        </div>
        )}
    </div>
  )
}