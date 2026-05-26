import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // frontend: http://localhost:5173/api/*
      // backend:  https://localhost:7206/api/*
      '/api': {
        target: 'https://localhost:7205',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
