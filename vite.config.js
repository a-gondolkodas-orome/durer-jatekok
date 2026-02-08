import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/durer-jatekok/' : '/',
  esbuild: {
    include: /\.js$/,
    exclude: [],
    loader: 'jsx'
  },
  server: {
    port: 8012
  }
}));
