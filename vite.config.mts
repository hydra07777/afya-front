import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://185.237.13.223:4000', // ton API HTTP
        changeOrigin: true,
        secure: false, // pas de SSL
        rewrite: (path) => path.replace(/^\/api/, ''), // facultatif si ton API n'a pas le préfixe
      },
    },
  },
});
