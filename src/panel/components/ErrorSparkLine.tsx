import { useMemo } from 'react'
import type { GroupedError } from '../../types'

interface Props {
  errors: GroupedError[]
  now: number           // ← passed from parent
}

export function ErrorSparkline({ errors, now }: Props) {
  const points = useMemo(() => {
    if (errors.length < 2) return null

    const windowMs  = 5 * 60 * 1000
    const bucketSize = windowMs / 10
    const buckets   = Array(10).fill(0)

    errors.forEach(({ payload }) => {
      const age = now - payload.timestamp
      if (age > windowMs) return
      const bucket = Math.min(Math.floor(age / bucketSize), 9)
      buckets[9 - bucket]++
    })

    const max = Math.max(...buckets, 1)
    const w = 40, h = 16
    const bw = w / buckets.length

    return buckets
      .map((v, i) => `${i * bw + bw / 2},${h - (v / max) * h}`)
      .join(' ')
  }, [errors, now])

  if (!points) return null

  return (
    <svg width={40} height={16} viewBox="0 0 40 16"
      style={{ display: 'block', opacity: 0.7 }}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--red-text)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}