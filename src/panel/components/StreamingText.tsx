interface Props { text: string }

export function StreamingText({ text }: Props) {
  return (
    <div style={{
      padding: '10px',
      background: 'var(--bg-base)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-ui)',
      fontSize: '11px',
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {text}
      <span style={{
        display: 'inline-block',
        width: '7px', height: '13px',
        background: 'var(--accent)',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        borderRadius: '1px',
        animation: 'blink 1s step-end infinite',
      }}/>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}