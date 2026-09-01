import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const proxy = {
  '/api': {
    target: 'https://api.currencybeacon.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
    env: {
      VITE_CURRENCYBEACON_API_KEY: 'test-key',
    },
  },
})
