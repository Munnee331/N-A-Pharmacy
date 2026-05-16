import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals:      true,
    environment:  'node',
    testTimeout:  30000,
    singleThread: true,
    // Load .env before any test file runs
    setupFiles:   ['./src/__tests__/setup.js'],
  },
})
