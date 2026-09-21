import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://waisira.vercel.app',
  // Keep /admin out of the sitemap — it was being handed straight to Google.
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});