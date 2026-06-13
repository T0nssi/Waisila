import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://waisira.com',
  integrations: [tailwind(), sitemap()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
