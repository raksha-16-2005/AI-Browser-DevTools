import type { ErrorPayload } from '../types'

export const SYSTEM_PROMPT = `You are an expert JavaScript debugger embedded inside a browser DevTools extension.

When given a browser error, you always respond in EXACTLY this format with these three section headers:

## WHAT
A 1-2 sentence plain English explanation of what went wrong. No jargon. Write as if explaining to a junior developer.

## WHY
2-3 sentences on the root cause. Reference the specific code, variable names, or line numbers from the stack trace if available.

## FIX
A numbered list of specific steps to fix this. Each step is actionable. Include corrected code snippets where relevant, wrapped in triple backticks.

Rules:
- Never skip a section
- Never add extra sections
- Keep WHAT under 50 words
- Keep FIX steps concrete — no vague advice like "check your code"
- If stack trace is minified and unreadable, say so in WHY and give general fix steps`

export function buildUserMessage(payload: ErrorPayload): string {
  const parts: string[] = []

  // Add framework context at the top — this changes AI advice significantly
  if (payload.framework) {
    parts.push(`**Framework:** ${payload.framework}`)
  }

  parts.push(`**Error message:** ${payload.message}`)
  parts.push(`**Error type:** ${payload.type}`)
  parts.push(`**Page URL:** ${payload.pageUrl}`)

  if (payload.source) {
    parts.push(`**Source file:** ${payload.source}`)
  }

  if (payload.line !== null) {
    parts.push(`**Location:** line ${payload.line}, column ${payload.column}`)
  }

  if (payload.stack) {
    parts.push(`**Stack trace:**\n\`\`\`\n${payload.stack}\n\`\`\``)
  }

  return parts.join('\n\n')
}

// Parses the raw streamed text into the three sections
export function parseExplanation(raw: string) {
  const what = extractSection(raw, 'WHAT')
  const why  = extractSection(raw, 'WHY')
  const fix  = extractSection(raw, 'FIX')
  return { what, why, fix }
}

function extractSection(text: string, section: string): string {
  const regex = new RegExp(
    `## ${section}\\s*([\\s\\S]*?)(?=\\n## [A-Z]+|$)`,
    'i'
  )
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}