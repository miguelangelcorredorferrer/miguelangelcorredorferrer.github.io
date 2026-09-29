/**
 * Carga y valida los YAML de src/data/ en build. Un error de formato
 * detiene el build con el mensaje de Zod.
 */
import { parse } from 'yaml';
import type { z } from 'astro/zod';
import {
  certsFileSchema,
  languagesFileSchema,
  profileSchema,
  skillsFileSchema,
  timelineFileSchema,
} from '@/content/schemas';
import profileRaw from '@/data/profile.yaml?raw';
import certsRaw from '@/data/certs.yaml?raw';
import languagesRaw from '@/data/languages.yaml?raw';
import skillsRaw from '@/data/skills.yaml?raw';
import timelineRaw from '@/data/timeline.yaml?raw';
import type { Locale } from '@/i18n';
import { withBase } from '@/lib/urls';

function load<T extends z.ZodType>(file: string, raw: string, schema: T): z.infer<T> {
  const result = schema.safeParse(parse(raw) ?? {});
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(raíz)'}: ${i.message}`).join('\n');
    throw new Error(`src/data/${file} no es válido:\n${issues}`);
  }
  return result.data;
}

export const profile = load('profile.yaml', profileRaw, profileSchema);
export const certsFile = load('certs.yaml', certsRaw, certsFileSchema);
export const languages = load('languages.yaml', languagesRaw, languagesFileSchema).languages;
export const skills = load('skills.yaml', skillsRaw, skillsFileSchema).groups;
export const timeline = load('timeline.yaml', timelineRaw, timelineFileSchema);

/** Certificaciones visibles: las `planned` solo si showPlanned es true. */
export const visibleCerts = certsFile.certs.filter((c) => c.status !== 'planned' || certsFile.showPlanned);

/** CV en el idioma pedido; si no existe esa versión, el español. */
export const cvHref = (lang: Locale): { href: string; lang: Locale } => {
  const path = profile.cv[lang];
  return path ? { href: withBase(path), lang } : { href: withBase(profile.cv.es), lang: 'es' };
};
