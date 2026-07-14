import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Endre base til '/<repo-navn>/' når du publiserer på GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
});
