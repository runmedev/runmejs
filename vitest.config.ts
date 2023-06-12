/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: ['tests/*.test.ts'],
    /**
     * not to ESM ported packages
     */
    exclude: [
      'tests/cjs',
      'dist', '.idea', '.git', '.cache',
      '**/node_modules/**'
    ],
    testTimeout: 30 * 1000,
    watch: false,
    coverage: {
      enabled: false
    }
  }
})
