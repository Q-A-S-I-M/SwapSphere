import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // forward API calls to backend running on 8081 (dev configuration)
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '/ws': {
        // forward websocket traffic to backend websocket endpoint
        target: 'ws://localhost:8081',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
