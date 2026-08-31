import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base define o prefixo dos assets no build — necessário porque o admin é servido em /admin/
  base: '/admin/',
  build: {
    emptyOutDir: true
  }
})

