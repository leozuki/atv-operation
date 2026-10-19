import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Token is read server-side only (no VITE_ prefix) so it never reaches the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    server: {
      port: 5190,
      strictPort: true,
      proxy: {
        '/api/hubspot': {
          target: 'https://api.hubapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hubspot/, ''),
          headers: {
            Authorization: `Bearer ${env.HUBSPOT_ACCESS_TOKEN || ''}`,
          },
        },
      },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.{js,jsx}'],
      setupFiles: ['tests/setup.js'],
      // Full-app jsdom renders visit all 15 tabs and can exceed the 5s default on slower machines.
      testTimeout: 20000,
    },
  }
})
