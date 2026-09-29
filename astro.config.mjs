// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SHIKI_THEMES, cspSafeTransformer, writeShikiCss } from './src/lib/shiki-csp.mjs';

// ─────────────────────────────────────────────────────────────
// Despliegue: único punto de configuración de URL.
//   SITE_URL  → origen público, p. ej. https://usuario.github.io
//   BASE_PATH → subruta: "/" para usuario.github.io o dominio propio,
//               "/nombre-repo" para un repo de proyecto.
// En CI se rellenan automáticamente desde actions/configure-pages.
// ─────────────────────────────────────────────────────────────
const SITE_URL = process.env.SITE_URL || 'https://example.github.io';
const BASE_PATH = process.env.BASE_PATH || '/';

// Hoja de clases para el resaltado de código (ver src/lib/shiki-csp.mjs).
await writeShikiCss(fileURLToPath(new URL('./src/styles/generated/shiki.css', import.meta.url)));

// Páginas /<idioma>/<colección>/<slug>/ que solo existen como fallback (sin traducción):
// se excluyen del sitemap porque su canonical apunta a la versión original.
const fallbackPaths = ['projects', 'writeups'].flatMap((kind) => {
  const dir = (/** @type {string} */ lang) => new URL(`./src/content/${kind}/${lang}/`, import.meta.url);
  const slugs = (/** @type {string} */ lang) =>
    existsSync(dir(lang)) ? readdirSync(dir(lang)).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
  const es = slugs('es');
  const en = slugs('en');
  return [
    ...es.filter((s) => !en.includes(s)).map((s) => `/en/${kind}/${s}/`),
    ...en.filter((s) => !es.includes(s)).map((s) => `/es/${kind}/${s}/`),
  ];
});
const basePrefix = BASE_PATH.replace(/\/+$/, '');

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'always',

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', en: 'en' } },
      filter: (page) => {
        const path = new URL(page).pathname.slice(basePrefix.length) || '/';
        return path !== '/' && !fallbackPaths.includes(path);
      },
    }),
  ],

  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },

  build: {
    // CSP: nada de <style> ni <script> en línea; todo como archivo externo.
    inlineStylesheets: 'never',
  },

  vite: {
    build: {
      // Evita data: URIs para fuentes, imágenes o scripts pequeños (CSP).
      assetsInlineLimit: 0,
    },
  },

  markdown: {
    shikiConfig: {
      themes: SHIKI_THEMES,
      defaultColor: false,
      wrap: false,
      transformers: [cspSafeTransformer()],
    },
  },
});
