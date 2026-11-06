// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Set this to your real domain before deploying (used for canonical URLs).
  site: 'https://example.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
