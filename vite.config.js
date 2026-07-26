import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Vitest covers the pure schema and validation modules only: no React,
  // no browser, no network, no API key.
  test: {
    environment: 'node',
    include: ['api/_lib/**/*.test.js'],
  },
})
