// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

export default defineConfig({
  // Production domain (used for canonical URLs).
  site: 'https://pop.consulting',

  // Dev only: accept forwarded/preview hostnames (cloud previews, tunnels).
  server: {
    allowedHosts: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});