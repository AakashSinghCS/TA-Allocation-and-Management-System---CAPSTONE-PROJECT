
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  // test: {
  //   globals: true,                // use describe/it/expect without imports
  //   environment: 'jsdom',         // simulate a browser DOM
  //   setupFiles: './setupTests.ts',
  //   include: ['src/**/*.{test,spec}.{ts,tsx}','../../test/frontend/**/*.{test,spec}.{ts,tsx}'], 
  // },
})
