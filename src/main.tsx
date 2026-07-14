import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/App'
import '@/app/styles.css'
import { readSystemConfig } from '@/features/system-config'
import { initializeTheme, ThemeProvider } from '@/features/theme'

initializeTheme()
readSystemConfig()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
