/**
 * Esquemas de contenido: única fuente de verdad.
 *
 * Los usan `src/content.config.ts` (build de Astro), `src/lib/data.ts`
 * (YAML de `src/data/`) y `scripts/check-content.mjs` (CI). Por eso este
 * archivo solo importa `astro/zod` y tipos: Node 24 lo ejecuta tal cual.
 */
import { z } from 'astro/zod';
import type { ImageFunction } from 'astro:content';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const text = z.string().trim().min(1);
const httpUrl = z.url({ protocol: /^https?$/, error: 'Debe ser una URL http(s) válida.' });
/** Año o año-mes: "2024" o "2024-09". Entre comillas en YAML. */
const yearMonth = z.string().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Formato esperado: "AAAA" o "AAAA-MM".');
const tags = z.array(text).min(1, 'Añade al menos una etiqueta.');

/** Texto traducible: `es` obligatorio, `en` opcional (si falta se usa `es`). */
export const localized = z.object({ es: text, en: text.optional() });
export type Localized = z.infer<typeof localized>;

// ── Colecciones Markdown ──────────────────────────────────────

export const PROJECT_CATEGORIES = ['devsecops', 'security'] as const;
export const PROJECT_STATUS = ['in-progress', 'done'] as const;

/** `image` lo inyecta Astro; el comprobador pasa un sustituto que acepta rutas. */
export const projectSchema = (image: ImageFunction) =>
  z
    .object({
      title: text,
      summary: text.max(220, 'Resumen de 220 caracteres como máximo (se usa como meta description).'),
      category: z.enum(PROJECT_CATEGORIES),
      tags,
      status: z.enum(PROJECT_STATUS),
      date: z.coerce.date(),
      repo: httpUrl.optional(),
      demo: httpUrl.optional(),
      featured: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: text.optional(),
      metrics: z.array(z.object({ label: text, value: text })).default([]),
    })
    .refine((d) => !d.cover || d.coverAlt, {
      message: '`coverAlt` es obligatorio cuando hay `cover` (texto alternativo).',
      path: ['coverAlt'],
    });

export const WRITEUP_DIFFICULTIES = ['easy', 'medium', 'hard', 'insane'] as const;

export const writeupSchema = z.object({
  platform: text,
  name: text,
  summary: text.max(220, 'Resumen de 220 caracteres como máximo (se usa como meta description).'),
  difficulty: z.enum(WRITEUP_DIFFICULTIES),
  os: text,
  date: z.coerce.date(),
  tags,
  // Solo máquinas retiradas. Si falta o es `false`, el build falla.
  retired: z.literal(true, {
    error: 'Solo se publican máquinas retiradas: `retired: true` es obligatorio.',
  }),
});

/** Encabezado obligatorio en cada writeup, según su idioma. */
export const DEFENSIVE_HEADING: Record<Locale, string> = {
  es: 'Visión defensiva',
  en: 'Defensive view',
};

// ── Datos YAML (src/data) ─────────────────────────────────────

export const CERT_STATUS = ['obtained', 'in-progress', 'planned'] as const;

export const certsFileSchema = z.object({
  showPlanned: z.boolean().default(false),
  certs: z
    .array(
      z.object({
        name: text,
        issuer: text,
        status: z.enum(CERT_STATUS),
        date: yearMonth.optional(),
        /** Fecha de caducidad, si la tiene. */
        expires: yearMonth.optional(),
        credentialUrl: httpUrl.optional(),
        /** Nombre de archivo dentro de src/assets/badges/ */
        badge: text.optional(),
      }),
    )
    .default([]),
});

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const;

export const languagesFileSchema = z.object({
  languages: z.array(
    z.object({
      language: localized,
      level: z.enum(CEFR_LEVELS),
      certificate: text.optional(),
    }),
  ),
});

export const SKILL_ICONS = ['network', 'server', 'shield', 'cloud', 'code', 'terminal'] as const;

export const skillsFileSchema = z.object({
  groups: z.array(
    z.object({
      area: localized,
      /** Icono del área (opcional): network | server | shield | cloud | code | terminal */
      icon: z.enum(SKILL_ICONS).optional(),
      /** Cada elemento: texto (igual en ambos idiomas) o { es, en }. */
      items: z.array(z.union([text, localized])).min(1),
    }),
  ),
});

export const profileSchema = z.object({
  name: text,
  /** Versión corta para la cabecera (opcional; si falta se usa `name`). */
  shortName: text.optional(),
  headline: localized,
  /** Ubicación visible en el hero, p. ej. "Córdoba, España". */
  location: localized.optional(),
  /** Nombre de archivo dentro de src/assets/profile/ (opcional). */
  photo: text.optional(),
  positioning: localized,
  currently: localized.optional(),
  about: localized,
  links: z.object({
    linkedin: httpUrl.optional(),
    github: httpUrl.optional(),
  }),
  /** Se divide en dos para que la dirección nunca aparezca completa en el HTML. */
  email: z.object({ user: text, domain: text }).optional(),
  /** Rutas relativas a public/, p. ej. /cv/cv-es.pdf */
  cv: z.object({
    es: z.string().regex(/^\/.+\.pdf$/, 'Ruta dentro de public/ que empiece por "/" y acabe en .pdf'),
    en: z.string().regex(/^\/.+\.pdf$/, 'Ruta dentro de public/ que empiece por "/" y acabe en .pdf').optional(),
  }),
});

const timelineEntry = z.object({
  title: localized,
  org: text,
  /** Nombre de archivo dentro de src/assets/logos/ (opcional). */
  logo: text.optional(),
  start: yearMonth,
  /** Omitir si sigue en curso. */
  end: yearMonth.optional(),
  description: localized.optional(),
});

export const timelineFileSchema = z.object({
  experience: z.array(timelineEntry).default([]),
  education: z.array(timelineEntry).default([]),
});

export type Profile = z.infer<typeof profileSchema>;
export type CertsFile = z.infer<typeof certsFileSchema>;
export type Cert = CertsFile['certs'][number];
export type LanguagesFile = z.infer<typeof languagesFileSchema>;
export type SkillsFile = z.infer<typeof skillsFileSchema>;
export type TimelineFile = z.infer<typeof timelineFileSchema>;
export type TimelineEntry = z.infer<typeof timelineEntry>;
