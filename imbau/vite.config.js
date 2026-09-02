import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Caminhos relativos: a pasta dist/ funciona em subdiretório
  // (GitHub Pages, /imbau no domínio da cliente, etc.).
  base: './',
});
