/**
 * TypeScript implementation of intelligent code snippet extraction
 * Extracts relevant code context around error lines with dynamic range calculation
 */

interface SnippetResult {
  snippet: string
  startLine: number
  endLine: number
}

/**
 * Extract code context around an error line with intelligent range calculation
 * @param sourceCode - Full source code as string
 * @param errorLine - 1-based line number where error occurred
 * @param errorColumn - 1-based column number (optional)
 * @returns Extracted snippet with context
 */
export function extractSnippet(
  sourceCode: string,
  errorLine: number,
  _errorColumn?: number
): SnippetResult {
  if (!sourceCode || errorLine < 1) {
    return { snippet: sourceCode || '', startLine: 1, endLine: 1 }
  }

  const lines = sourceCode.split('\n')
  const totalLines = lines.length

  // Validate error line
  const validErrorLine = Math.min(Math.max(errorLine, 1), totalLines)
  const errorLineIndex = validErrorLine - 1

  // Get indent level of error line for intelligent range calculation
  const errorIndent = getIndentLevel(lines[errorLineIndex])

  // Calculate dynamic range based on code structure
  const { before, after } = calculateDynamicRange(
    lines,
    errorLineIndex,
    errorIndent
  )

  const startLine = Math.max(0, errorLineIndex - before)
  const endLine = Math.min(totalLines - 1, errorLineIndex + after)

  // Extract lines and rejoin
  const snippet = lines.slice(startLine, endLine + 1).join('\n')

  return {
    snippet,
    startLine: startLine + 1, // Convert to 1-based
    endLine: endLine + 1,
  }
}

/**
 * Calculate how many lines of context to include before/after error
 * Uses code structure (indentation, brackets) to determine reasonable bounds
 */
function calculateDynamicRange(
  lines: string[],
  errorLineIndex: number,
  errorIndent: number
): { before: number; after: number } {
  // Base range (always include some context)
  let before = 3
  let after = 3

  // Look backwards for opening bracket/function/class
  let bracketCount = 0
  for (let i = errorLineIndex - 1; i >= 0 && before < 10; i--) {
    const line = lines[i]
    const indent = getIndentLevel(line)

    // Count brackets for closure detection
    bracketCount += (line.match(/[{]/g) || []).length
    bracketCount -= (line.match(/[}]/g) || []).length

    // Expand range if we see function/class keywords at lower indent
    if (
      indent <= errorIndent &&
      /\b(function|class|const|let|var|if|for|while|try|catch)\b/.test(line)
    ) {
      before = Math.max(before, errorLineIndex - i)
    }
  }

  // Look forwards for closing bracket
  bracketCount = 0
  for (let i = errorLineIndex + 1; i < lines.length && after < 10; i++) {
    const line = lines[i]
    const indent = getIndentLevel(line)

    bracketCount += (line.match(/[{]/g) || []).length
    bracketCount -= (line.match(/[}]/g) || []).length

    // Expand range if we find matching closing bracket
    if (bracketCount < 0) {
      after = Math.max(after, i - errorLineIndex)
      break
    }

    // If we hit code at same indent level, stop
    if (indent <= errorIndent && line.trim() !== '' && /\S/.test(line)) {
      after = Math.max(after, i - errorLineIndex)
    }
  }

  return { before: Math.min(before, 8), after: Math.min(after, 8) }
}

/**
 * Get indentation level of a line (in spaces)
 * Cached with LRU for performance since same indents appear frequently
 */
const indentCache = new Map<string, number>()

function getIndentLevel(line: string): number {
  if (indentCache.has(line)) {
    return indentCache.get(line)!
  }

  const match = line.match(/^(\s*)/)
  const indent = match ? match[1].length : 0

  // Keep cache size bounded
  if (indentCache.size > 1000) {
    const first = indentCache.keys().next().value as string | undefined
    if (first) indentCache.delete(first)
  }

  indentCache.set(line, indent)
  return indent
}

/**
 * Format snippet for use in AI prompts
 */
export function formatSnippetForPrompt(result: SnippetResult): string {
  return `\`\`\`javascript
${result.snippet}
\`\`\`

(Lines ${result.startLine}-${result.endLine})`
}
