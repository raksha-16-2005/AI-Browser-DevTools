export function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '32px',
      color: 'var(--text-muted)',
    }}>
      {/* Simple grid icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4"  y="4"  width="10" height="10" rx="2" stroke="var(--border-light)" strokeWidth="1.5"/>
        <rect x="18" y="4"  width="10" height="10" rx="2" stroke="var(--border-light)" strokeWidth="1.5"/>
        <rect x="4"  y="18" width="10" height="10" rx="2" stroke="var(--border-light)" strokeWidth="1.5"/>
        <rect x="18" y="18" width="10" height="10" rx="2" stroke="var(--border-light)" strokeWidth="1.5"/>
      </svg>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        No errors captured
      </span>
      <span style={{ fontSize: '11px', textAlign: 'center', lineHeight: 1.6 }}>
        Errors on the inspected page<br/>will appear here automatically
      </span>
      <div style={{
        marginTop: '8px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
      }}>
        setTimeout(() =&gt; {'{ throw new Error("test") }'}, 100)
      </div>
    </div>
  )
}