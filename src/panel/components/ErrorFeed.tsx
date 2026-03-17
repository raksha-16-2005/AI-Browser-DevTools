import type { ErrorPayload, AIExplanation, GroupedError } from '../../types'
import { ErrorCard } from './ErrorCard'
import { EmptyState } from './EmptyState'

interface AIState {
  status: 'loading' | 'done' | 'error'
  streamText: string
  explanation: AIExplanation | null
  error: string | null
}

interface Props {
  errors: GroupedError[]
  aiStates: Record<string, AIState>
  selectedId: string | null
  onExplain: (err: ErrorPayload) => void
  onSelect: (id: string) => void
}

export function ErrorFeed({ errors, aiStates, selectedId, onExplain, onSelect }: Props) {
  if (errors.length === 0) return <EmptyState />

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '8px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--border) transparent',
    }}>
      {errors.map(group => (
    <ErrorCard
        key={group.payload.id}
        error={group.payload}
        count={group.count}           // ← new prop
        firstSeen={group.firstSeen}   // ← new prop
        isSelected={selectedId === group.payload.id}
        aiState={aiStates[group.payload.id]}
        onExplain={onExplain}
        onSelect={onSelect}
    />
    ))}
    </div>
  )
}