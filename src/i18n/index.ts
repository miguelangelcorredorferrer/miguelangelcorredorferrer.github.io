import { LOCALES, type Locale, type Localized } from '@/content/schemas';
import { es, type UIStrings } from './es';
import { en } from './en';

export { LOCALES, type Locale };
export const DEFAULT_LOCALE: Locale = 'es';

const dictionaries: Record<Locale, UIStrings> = { es, en };

export const useTranslations = (lang: Locale): UIStrings => dictionaries[lang];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const otherLocale = (lang: Locale): Locale => (lang === 'es' ? 'en' : 'es');

/** Texto traducible de los YAML: `en` si existe y se pide, si no `es`. */
export const pick = (value: Localized, lang: Locale): string => (lang === 'en' ? (value.en ?? value.es) : value.es);

/** Valores para og:locale. */
export const ogLocale: Record<Locale, string> = { es: 'es_ES', en: 'en_GB' };

export const formatDate = (
  date: Date,
  lang: Locale,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' },
): string => new Intl.DateTimeFormat(lang, { timeZone: 'UTC', ...opts }).format(date);

/** "2024-09" → "sept 2024" / "Sep 2024"; "2024" → "2024". */
export const formatYearMonth = (value: string, lang: Locale): string => {
  const [y, m] = value.split('-');
  if (!m) return y ?? value;
  return formatDate(new Date(Date.UTC(Number(y), Number(m) - 1, 1)), lang);
};

/** Parámetros de getStaticPaths para páginas con idioma. */
export const localeStaticPaths = () => LOCALES.map((lang) => ({ params: { lang } }));
