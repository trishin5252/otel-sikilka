import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/otel-sikilka/',  // ← Имя вашего репозитория
  build: {
    outDir: 'dist'
  }
})