import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://zibgger.github.io',
  base: '/zibgger',

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  server: {
    host: '0.0.0.0',
    port: 4321,
  },
});
