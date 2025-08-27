import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path based on environment
  const base = mode === 'preview' ? '/tradeborn_realms/' : '/'
  
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  }
})
