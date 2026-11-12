import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    modulePreload: false,
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/acceptance/**', 'node_modules/**', 'dist/**'],
  },
});
