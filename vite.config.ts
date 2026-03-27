import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://argocd.diamond.ac.uk',
        changeOrigin: true,
        secure: true,
      },
      '/login': {
        target: 'https://argocd.diamond.ac.uk',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://argocd.diamond.ac.uk',
        changeOrigin: true,
        secure: true,
      },
    }
  }
})
