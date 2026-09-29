import type { Locale } from '@/i18n';

/** Base configurada en astro.config ("" o "/nombre-repo"), sin barra final. */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Prefija la base a una ruta del sitio (sirve para archivos de public/). */
export const withBase = (path: string): string => `${BASE}/${path.replace(/^\/+/, '')}`;

/** URL de página con idioma y barra final: pagePath('es', 'projects') → /es/projects/ */
export const pagePath = (lang: Locale, path = ''): string => {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return withBase(clean ? `${lang}/${clean}/` : `${lang}/`);
};

/** Ruta actual sin base ni idioma: "/repo/es/projects/foo/" → "projects/foo" */
export const stripLocale = (pathname: string): string => {
  const noBase = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return noBase.replace(/^\/(es|en)(\/|$)/, '').replace(/^\/+|\/+$/g, '');
};

export const isExternal = (href: string): boolean => /^https?:\/\//.test(href);
