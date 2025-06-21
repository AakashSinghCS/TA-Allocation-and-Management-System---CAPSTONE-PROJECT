import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                // use describe/it/expect without imports
    environment: 'jsdom',         // simulate a browser DOM
    setupFiles: './setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}','tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './my-custom-coverage', 
    },
  },
})
