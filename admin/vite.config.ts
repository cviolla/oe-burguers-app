import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removendo base fixa e outDir personalizado para permitir deploy flexível
  // Se for deploy unificado, o script da raiz deve tratar a movimentação dos arquivos
  build: {
    emptyOutDir: true
  }
})
