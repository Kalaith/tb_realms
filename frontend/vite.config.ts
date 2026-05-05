import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  const configuredBasePath = process.env.VITE_BASE_PATH ?? env.VITE_BASE_PATH;
  if (!configuredBasePath) {
    throw new Error('VITE_BASE_PATH environment variable is required');
  }
  const base = configuredBasePath.endsWith('/') ? configuredBasePath : `${configuredBasePath}/`;

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
    },
  };
});
