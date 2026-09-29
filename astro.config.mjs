// @ts-check
import { defineConfig } from 'astro/config';
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

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'always',

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
