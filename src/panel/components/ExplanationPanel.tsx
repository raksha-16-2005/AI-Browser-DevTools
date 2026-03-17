import type { AIExplanation } from '../../types'
import { StreamingText } from './StreamingText'
import { SectionBlock } from './SectionBlock'

interface Props {
  errorId: string
  streamingText: string
  explanation: AIExplanation | null
  isLoading: boolean
  error: string | null
}

export function ExplanationPanel({
  streamingText, explanation, isLoading, error
}: Props) {

  if (error) {
    return (
      <div style={{
        marginTop: '8px',
        padding: '10px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--red-bg)',
        border: '1px solid var(--red-border)',
        color: 'var(--red-text)',
        fontSize: '11px',
        fontFamily: 'var(--font-ui)',
      }}>
        {error}
      </div>
    )
  }

  if (isLoading && !streamingText) {
    return (
      <div style={{
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontFamily: 'var(--font-ui)',
      }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
        Thinking...
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isLoading && streamingText) {
    return (
      <div style={{ marginTop: '8px' }}>
        <StreamingText text={streamingText} />
      </div>
    )
  }

  if (!explanation) return null

  return (
    <div style={{ marginTop: '8px' }}>
      <SectionBlock
        label="What"
        content={explanation.what}
        accent="var(--blue-text)"
        defaultOpen={true}
      />
      <SectionBlock
        label="Why"
        content={explanation.why}
        accent="var(--amber-text)"
        defaultOpen={true}
      />
      <SectionBlock
        label="Fix"
        content={explanation.fix}
        accent="var(--green-text)"
        defaultOpen={true}
      />
    </div>
  )
}