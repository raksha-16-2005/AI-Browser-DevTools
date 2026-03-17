import { SYSTEM_PROMPT, buildUserMessage, parseExplanation } from './prompt'
import type { ErrorPayload, AIExplanation } from '../types'

const MODEL = 'gemini-2.0-flash'

export async function explainError(
  payload: ErrorPayload,
  apiKey: string,
  onChunk: (chunk: string) => void,
  onDone: (explanation: AIExplanation) => void,
  onError: (message: string) => void
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

  let fullText = ''

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildUserMessage(payload) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      onError(err?.error?.message ?? `Gemini API error: ${response.status}`)
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
        if (!data || data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          if (chunk) {
            fullText += chunk
            onChunk(chunk)
          }
        } catch {
          // malformed chunk — skip
        }
      }
    }

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