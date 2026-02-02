import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'smol-toml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const settingPath = join(__dirname, 'setting.toml');
const settingContent = readFileSync(settingPath, 'utf-8');
const settings = parse(settingContent);

if (!settings.site_url) {
  console.warn('⚠️  Warning: site_url is not configured in setting.toml.');
  console.warn('   Please set site_url for SEO. (e.g., site_url = "https://7loro.github.io")');
}

export default defineConfig({
  site: settings.site_url,
  base: '/',
  integrations: [sitemap()],
  vite: {
    define: {
      'import.meta.env.BLOG_NAME': JSON.stringify(settings.blog_name),
      'import.meta.env.LOCALE': JSON.stringify(settings.locale || 'en'),
      'import.meta.env.INTRO': JSON.stringify(settings.intro || {}),
      'import.meta.env.COMMENTS': JSON.stringify(settings.comments || { enabled: false }),
      'import.meta.env.ANALYTICS': JSON.stringify(settings.analytics || { enabled: false }),
    },
  },
});
