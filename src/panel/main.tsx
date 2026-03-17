import './styles/tokens.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

function init() {
  const rootEl = document.getElementById('root')
  if (!rootEl) return
  createRoot(rootEl).render(<StrictMode><App /></StrictMode>)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}