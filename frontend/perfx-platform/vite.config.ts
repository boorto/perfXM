import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This is needed to prevent "process is not defined" error in aiService.ts
    'process.env': {}
  }
})