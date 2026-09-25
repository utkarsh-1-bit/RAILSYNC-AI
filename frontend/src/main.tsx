import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BlockProvider } from './context/BlockContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlockProvider>
      <App />
    </BlockProvider>
  </StrictMode>,
)
