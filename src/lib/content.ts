import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/i18n';

type Name = 'projects' | 'writeups';

export interface Item<N extends Name> {
  entry: CollectionEntry<N>;
  slug: string;
  /** Idioma real del contenido mostrado. */
  contentLang: Locale;
  /** true si se muestra otro idioma porque falta la traducción. */
  isFallback: boolean;
}

export type ProjectItem = Item<'projects'>;
export type WriteupItem = Item<'writeups'>;

/** "es/mi-proyecto" → { lang: "es", slug: "mi-proyecto" } */
const splitId = (id: string) => {
  const [lang, ...rest] = id.split('/');
  return { lang, slug: rest.join('/') };
};

/**
 * Una entrada por slug en el idioma pedido. Si falta la traducción, usa la
 * versión en el idioma por defecto (o la que exista) y la marca como fallback.
 */
async function localized<N extends Name>(name: N, lang: Locale): Promise<Item<N>[]> {
  const entries = (await getCollection(name)) as CollectionEntry<N>[];
  const bySlug = new Map<string, Partial<Record<Locale, CollectionEntry<N>>>>();
  for (const entry of entries) {
    const { lang: entryLang, slug } = splitId(entry.id);
    if (!isLocale(entryLang) || !slug) continue;
    bySlug.set(slug, { ...bySlug.get(slug), [entryLang]: entry });
  }

  const order = [lang, DEFAULT_LOCALE, ...LOCALES];
  const items: Item<N>[] = [];
  for (const [slug, versions] of bySlug) {
    const contentLang = order.find((l) => versions[l]);
    if (!contentLang) continue;
    items.push({ entry: versions[contentLang]!, slug, contentLang, isFallback: contentLang !== lang });
  }
  return items.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

export const getProjects = (lang: Locale) => localized('projects', lang);
export const getWriteups = (lang: Locale) => localized('writeups', lang);

/** Rutas estáticas idioma × slug para las páginas de detalle. */
export async function detailPaths<N extends Name>(name: N) {
  const paths = [];
  for (const lang of LOCALES) {
    for (const item of await localized(name, lang)) {
      paths.push({ params: { lang, slug: item.slug }, props: { item } });
    }
  }
  return paths;
}

/** Minutos de lectura (≈ 220 palabras/min, sin contar bloques de código). */
export const readingTime = (body = ''): number => {
  const text = body.replace(/```[\s\S]*?```/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

/** Valor apto para data-atributos de filtro (sin espacios). */
export const filterKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '-');

/** Valores únicos ordenados. */
export const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));
