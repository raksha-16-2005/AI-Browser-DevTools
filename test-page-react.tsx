import React, { useState } from 'react'

interface ErrorLog {
  id: string
  timestamp: string
  message: string
  category: 'error' | 'warning' | 'info'
}

export default function TestPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const addLog = (message: string, category: 'error' | 'warning' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const id = Math.random().toString(36).substr(2, 9)
    setLogs((prev) => [{ id, timestamp, message, category }, ...prev].slice(0, 50))
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ==================== ERROR TRIGGERS ====================

  const triggerTypeError = () => {
    addLog('❌ Triggering TypeError...', 'warning')
    const obj = null
    ;(obj as any).property = 'value'
  }

  const triggerReferenceError = () => {
    addLog('❌ Triggering ReferenceError...', 'warning')
    ;(window as any).thisVariableDoesNotExist
  }

  const triggerSyntaxError = () => {
    addLog('❌ Triggering SyntaxError...', 'warning')
    const json = '{ invalid json }'
    JSON.parse(json)
  }

  const triggerSimpleError = () => {
    addLog('❌ Triggering Simple Error...', 'warning')
    throw new Error('This is a simple thrown error from the test page')
  }

  const triggerDirectRejection = () => {
    addLog('⚠️ Triggering Promise Rejection...', 'warning')
    Promise.reject(new Error('Direct unhandled promise rejection'))
  }

  const triggerPromiseChainError = () => {
    addLog('⚠️ Triggering Promise Chain Error...', 'warning')
    new Promise((resolve) => {
      resolve('data')
    }).then(() => {
      throw new Error('Error in promise chain')
    })
  }

  const triggerPromiseTimeoutError = () => {
    addLog('⚠️ Triggering Promise Timeout Error...', 'warning')
    new Promise((resolve) => {
      setTimeout(() => {
        throw new Error('Error in setTimeout inside promise')
      }, 100)
    })
  }

  const trigger400Error = () => {
    addLog('🌐 Requesting 400 Bad Request...', 'warning')
    fetch('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP 400 Bad Request: Invalid request`)
        return r.text()
      })
      .catch((e) => {
        throw new Error('400 Error: ' + e.message)
      })
  }

  const trigger401Error = () => {
    addLog('🌐 Requesting 401 Unauthorized...', 'warning')
    fetch('/api/protected', {
      headers: { Authorization: 'Bearer invalid-token' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP 401 Unauthorized: Invalid credentials`)
        return r.text()
      })
      .catch((e) => {
        throw new Error('401 Error: ' + e.message)
      })
  }

  const trigger404Error = () => {
    addLog('🌐 Requesting 404 Not Found...', 'warning')
    fetch('/api/this-endpoint-does-not-exist')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP 404 Not Found: /api/this-endpoint-does-not-exist`)
        return r.text()
      })
      .catch((e) => {
        throw new Error('404 Error: ' + e.message)
      })
  }

  const trigger500Error = () => {
    addLog('🌐 Requesting 500 Server Error...', 'warning')
    fetch('/api/error')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP 500 Server Error: Internal server error`)
        return r.text()
      })
      .catch((e) => {
        throw new Error('500 Error: ' + e.message)
      })
  }

  const clearLogs = () => {
    setLogs([])
    addLog('✅ Logs cleared', 'info')
  }

  interface ErrorSection {
    title: string
    icon: string
    color: string
    buttons: Array<{
      label: string
      onClick: () => void
      icon: string
    }>
  }

  const sections: ErrorSection[] = [
    {
      title: 'Uncaught Errors',
      icon: '🔴',
      color: 'from-red-900 to-red-800',
      buttons: [
        {
          label: 'TypeError - Property on Null',
          onClick: triggerTypeError,
          icon: '⚡',
        },
        {
          label: 'ReferenceError - Undefined Variable',
          onClick: triggerReferenceError,
          icon: '⚠️',
        },
        {
          label: 'SyntaxError - JSON Parse',
          onClick: triggerSyntaxError,
          icon: '❌',
        },
        {
          label: 'Simple Error - Direct Throw',
          onClick: triggerSimpleError,
          icon: '⚡',
        },
      ],
    },
    {
      title: 'Promise Rejections',
      icon: '⚠️',
      color: 'from-amber-900 to-amber-800',
      buttons: [
        {
          label: 'Unhandled Promise Rejection',
          onClick: triggerDirectRejection,
          icon: '⚠️',
        },
        {
          label: 'Promise Chain Error',
          onClick: triggerPromiseChainError,
          icon: '⚡',
        },
        {
          label: 'Promise Timeout Error',
          onClick: triggerPromiseTimeoutError,
          icon: '❌',
        },
      ],
    },
    {
      title: 'HTTP Status Errors',
      icon: '🌐',
      color: 'from-blue-900 to-blue-800',
      buttons: [
        {
          label: '400 Bad Request',
          onClick: trigger400Error,
          icon: '🌐',
        },
        {
          label: '401 Unauthorized',
          onClick: trigger401Error,
          icon: '🌐',
        },
        {
          label: '404 Not Found',
          onClick: trigger404Error,
          icon: '🌐',
        },
        {
          label: '500 Server Error',
          onClick: trigger500Error,
          icon: '🌐',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-green-600 to-green-700 mb-4 text-3xl">
            ⚡
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI DevTools Tester</h1>
          <p className="text-gray-400 text-lg">
            Click buttons below to trigger different error types and test the AI DevTools extension
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-700/40 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl text-green-500 mt-1 flex-shrink-0">✓</span>
            <div>
              <h3 className="font-semibold text-green-400 mb-1">How to Test</h3>
              <p className="text-sm text-gray-400">
                1. Open DevTools (F12) in your browser • 2. Click any button below to trigger an error • 3. Check both the
                Console tab AND the AI DevTools panel on the right sidebar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6 mb-8">
        {/* Error Sections */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/40 hover:border-gray-600 transition-colors"
            >
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.color} px-6 py-4 flex items-center gap-3`}>
                <div className="text-2xl">{section.icon}</div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>

              {/* Section Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.buttons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.onClick}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 border border-green-500/50 hover:border-green-400"
                    >
                      <span className="text-lg">{btn.icon}</span>
                      <span className="text-sm">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Total Errors */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-semibold">Total Triggered</h3>
              <span className="text-xl text-green-500">⚠️</span>
            </div>
            <div className="text-4xl font-bold text-green-400">{logs.length}</div>
            <p className="text-xs text-gray-500 mt-2">Errors logged in this session</p>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearLogs}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors border border-gray-600 hover:border-gray-500"
          >
            Clear All Logs
          </button>

          {/* Legend */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-4">Error Types</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-400">Critical Errors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-400">Promise Rejections</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-400">HTTP Errors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="max-w-7xl mx-auto">
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 overflow-hidden">
          <div className="bg-gradient-to-r from-green-900 to-green-800 px-6 py-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="text-lg font-bold text-white">Error Log</h3>
            <span className="ml-auto text-sm text-gray-300 px-3 py-1 rounded-full bg-gray-700/50">
              {logs.length} items
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-700">
            {logs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-2">No errors triggered yet</div>
                <p className="text-sm text-gray-600">Click a button above to trigger an error</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-700/20 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-gray-500 font-mono">{log.timestamp}</span>
                      {log.category === 'error' && <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400">ERROR</span>}
                      {log.category === 'warning' && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-900/30 text-amber-400">WARNING</span>
                      )}
                      {log.category === 'info' && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">INFO</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 break-words font-mono">{log.message}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.message, log.id)}
                    className="flex-shrink-0 p-2 rounded hover:bg-gray-700/50 transition-colors text-gray-500 hover:text-gray-300"
                    title="Copy to clipboard"
                  >
                    {copiedId === log.id ? (
                      <span className="text-lg text-green-500">✓</span>
                    ) : (
                      <span className="text-lg">📋</span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>
          AI DevTools Extension • Open DevTools (F12) to see error capture in action •{' '}
          <span className="text-green-500">Make it green</span>
        </p>
      </div>
    </div>
  )
}
