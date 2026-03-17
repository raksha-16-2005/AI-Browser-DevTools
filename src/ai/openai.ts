import { SYSTEM_PROMPT, buildUserMessage, parseExplanation } from './prompt'
import type { ErrorPayload, AIExplanation } from '../types'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o'

export async function explainError(
  payload: ErrorPayload,
  apiKey: string,
  onChunk: (chunk: string) => void,
  onDone: (explanation: AIExplanation) => void,
  onError: (message: string) => void
) {
  let fullText = ''

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 1000,
        temperature: 0.2,      // low temp = consistent structured output
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: buildUserMessage(payload) },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      onError(err?.error?.message ?? `OpenAI API error: ${response.status}`)
      return
    }

    // Read the SSE stream
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const chunk = json.choices?.[0]?.delta?.content ?? ''
          if (chunk) {
            fullText += chunk
            onChunk(chunk)
          }
        } catch {
          // malformed chunk — skip
        }
      }
    }

    // Parse the completed text into structured sections
    const explanation = parseExplanation(fullText)
    onDone(explanation)

  } catch (err: unknown) {
    if (err instanceof Error) {
      onError(err.message)
    } else if (typeof err === 'string') {
      onError(err)
    } else {
      onError('Unknown error calling OpenAI')
    }
  }
}