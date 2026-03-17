export interface ErrorPayload {
  id: string
  type: 'js_error' | 'promise_rejection' | 'network_error'
  message: string
  stack: string | null
  source: string | null
  line: number | null
  column: number | null
  timestamp: number
  pageUrl: string
  framework: string | null 
}

export interface GroupedError {
  payload: ErrorPayload
  count: number
  firstSeen: number
}

export interface AIExplanation {
  what: string
  why: string
  fix: string
}

export type MessageType =
  | { kind: 'ERROR_CAPTURED'; payload: ErrorPayload }
  | { kind: 'PANEL_READY'; tabId?: number }           // ← added tabId
  | { kind: 'ERRORS_FETCHED'; errors: ErrorPayload[] }
  | { kind: 'AI_REQUEST'; errorId: string; payload: ErrorPayload }
  | { kind: 'AI_CHUNK'; errorId: string; chunk: string }
  | { kind: 'AI_DONE'; errorId: string; explanation: AIExplanation }
  | { kind: 'AI_ERROR'; errorId: string; message: string }
  | { kind: 'DEVTOOLS_OPENED'; tabId: number }        // ← new
  | { kind: 'HEARTBEAT' }                             // ← keep-alive ping
  | { kind: 'HEARTBEAT_ACK' }                         // ← keep-alive ack