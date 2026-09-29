// @ts-check
import { defineConfig } from 'astro/config';

// ─────────────────────────────────────────────────────────────
// Despliegue: único punto de configuración de URL.
//   SITE_URL  → origen público, p. ej. https://usuario.github.io
//   BASE_PATH → subruta: "/" para usuario.github.io o dominio propio,
//               "/nombre-repo" para un repo de proyecto.
// En CI se rellenan automáticamente desde actions/configure-pages.
// ─────────────────────────────────────────────────────────────
const SITE_URL = process.env.SITE_URL ?? 'https://example.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'always',
});
