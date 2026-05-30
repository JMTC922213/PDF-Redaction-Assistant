import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fully client-side app — no backend, no proxy. Vite just serves the SPA.
export default defineConfig({
  plugins: [react()],
})
