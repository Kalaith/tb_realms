import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Determine base path from environment variable or fallback based on mode
  let base = '/';

  if (env.VITE_BASE_PATH) {
    // Use environment variable if set
    base = env.VITE_BASE_PATH.endsWith('/') ? env.VITE_BASE_PATH : env.VITE_BASE_PATH + '/';
  } else if (mode === 'preview') {
    // Fallback for preview mode
    base = '/tb_realms/';
  } else if (mode === 'production') {
    // Fallback for production mode
    base = '/tb_realms/';
  }

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
