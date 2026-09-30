#!/usr/bin/env node
/**
 * Comprobador de contenido: npm run check:content
 *
 * Falla (exit 1) si:
 *  - quedan marcadores [EJEMPLO] (salvo ALLOW_PLACEHOLDERS=1),
 *  - una entrada no cumple su esquema (campos obligatorios, writeup sin `retired: true`…),
 *  - un writeup no tiene la sección "Visión defensiva" / "Defensive view",
 *  - falta un archivo enlazado: CV, foto, logo, portada, imagen del cuerpo o insignia.
 *
 * Reutiliza los esquemas de src/content/schemas.ts (Node 24 ejecuta TypeScript sin compilar).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { z } from 'astro/zod';
import {
  DEFENSIVE_HEADING,
  LOCALES,
  certsFileSchema,
  languagesFileSchema,
  profileSchema,
  projectSchema,
  skillsFileSchema,
  timelineFileSchema,
  writeupSchema,
} from '../src/content/schemas.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '[EJEMPLO]';
const allowPlaceholders = process.env.ALLOW_PLACEHOLDERS === '1';

const errors = [];
const placeholders = [];
const rel = (p) => relative(ROOT, p).replaceAll('\\', '/');
const fail = (file, msg) => errors.push(`${rel(file)}: ${msg}`);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function reportIssues(file, zodError) {
  for (const issue of zodError.issues) {
    fail(file, `${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
  }
}

function splitFrontmatter(file, source) {
  const m = source.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    fail(file, 'falta el bloque de frontmatter (--- … ---) al principio del archivo.');
    return null;
  }
  try {
    return { data: parseYaml(m[1]) ?? {}, body: m[2] };
  } catch (e) {
    fail(file, `frontmatter YAML inválido: ${e.message}`);
    return null;
  }
}

/** Comprueba que una ruta local (relativa al .md o absoluta a public/) existe. */
function checkLocalPath(file, target, what) {
  if (/^(https?:)?\/\//.test(target) || target.startsWith('data:') || target.startsWith('#')) return;
  const clean = decodeURI(target.split(/[?#]/)[0]);
  const abs = clean.startsWith('/') ? join(ROOT, 'public', clean) : resolve(dirname(file), clean);
  if (!existsSync(abs)) fail(file, `${what} no encontrada: ${target}`);
}

// ── 1. Colecciones Markdown ───────────────────────────────────
const stubImage = () => z.string();
const collections = {
  projects: projectSchema(stubImage),
  writeups: writeupSchema,
};

for (const [name, schema] of Object.entries(collections)) {
  const base = join(ROOT, 'src/content', name);
  for (const file of walk(base).filter((f) => f.endsWith('.md'))) {
    const parts = relative(base, file).split(/[\\/]/);
    const lang = parts[0];
    if (parts.length !== 2 || !LOCALES.includes(lang)) {
      fail(file, `debe estar directamente en src/content/${name}/es/ o src/content/${name}/en/ (si no, el sitio lo ignora).`);
      continue;
    }
    const parsed = splitFrontmatter(file, readFileSync(file, 'utf8'));
    if (!parsed) continue;

    const result = schema.safeParse(parsed.data);
    if (!result.success) reportIssues(file, result.error);

    if (typeof parsed.data.cover === 'string') checkLocalPath(file, parsed.data.cover, 'portada');
    for (const m of parsed.body.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g)) checkLocalPath(file, m[1], 'imagen');
    for (const m of parsed.body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/g)) checkLocalPath(file, m[1], 'imagen');

    if (name === 'writeups') {
      const heading = DEFENSIVE_HEADING[lang];
      const re = new RegExp(`^##\\s+${heading}\\s*$`, 'm');
      if (!re.test(parsed.body)) fail(file, `falta la sección obligatoria "## ${heading}".`);
    }
  }
}

// ── 2. Datos YAML ─────────────────────────────────────────────
const dataFiles = {
  'profile.yaml': profileSchema,
  'certs.yaml': certsFileSchema,
  'languages.yaml': languagesFileSchema,
  'skills.yaml': skillsFileSchema,
  'timeline.yaml': timelineFileSchema,
};
const data = {};
for (const [fileName, schema] of Object.entries(dataFiles)) {
  const file = join(ROOT, 'src/data', fileName);
  if (!existsSync(file)) {
    fail(file, 'archivo obligatorio no encontrado.');
    continue;
  }
  let raw;
  try {
    raw = parseYaml(readFileSync(file, 'utf8')) ?? {};
  } catch (e) {
    fail(file, `YAML inválido: ${e.message}`);
    continue;
  }
  const result = schema.safeParse(raw);
  if (result.success) data[fileName] = result.data;
  else reportIssues(file, result.error);
}

const profile = data['profile.yaml'];
if (profile) {
  for (const [lang, path] of Object.entries(profile.cv)) {
    if (path && !existsSync(join(ROOT, 'public', path))) {
      fail(join(ROOT, 'src/data/profile.yaml'), `cv.${lang}: no existe public${path}`);
    }
  }
}
if (profile?.photo && !existsSync(join(ROOT, 'src/assets/profile', profile.photo))) {
  fail(join(ROOT, 'src/data/profile.yaml'), `photo: no existe src/assets/profile/${profile.photo}`);
}
const timelineData = data['timeline.yaml'];
for (const entry of [...(timelineData?.experience ?? []), ...(timelineData?.education ?? [])]) {
  if (entry.logo && !existsSync(join(ROOT, 'src/assets/logos', entry.logo))) {
    fail(join(ROOT, 'src/data/timeline.yaml'), `logo de "${entry.org}": no existe src/assets/logos/${entry.logo}`);
  }
}
for (const cert of data['certs.yaml']?.certs ?? []) {
  if (cert.badge && !existsSync(join(ROOT, 'src/assets/badges', cert.badge))) {
    fail(join(ROOT, 'src/data/certs.yaml'), `badge de "${cert.name}": no existe src/assets/badges/${cert.badge}`);
  }
}

// ── 3. Marcadores [EJEMPLO] ───────────────────────────────────
const scanDirs = ['src/content', 'src/data', 'src/assets', 'public'].map((d) => join(ROOT, d));
const skip = join(ROOT, 'src/content/_templates');
for (const file of scanDirs.flatMap(walk)) {
  if (file.startsWith(skip)) continue;
  const buf = readFileSync(file);
  if (buf.includes(MARKER)) {
    const count = buf.toString('latin1').split(MARKER).length - 1;
    placeholders.push(`${rel(file)} (${count})`);
  }
}

// ── Informe ───────────────────────────────────────────────────
if (placeholders.length) {
  const header = `Marcadores ${MARKER} en ${placeholders.length} archivo(s):`;
  if (allowPlaceholders) {
    console.warn(`⚠ ${header} (permitidos por ALLOW_PLACEHOLDERS=1)`);
    for (const p of placeholders) console.warn(`  - ${p}`);
  } else {
    errors.push(`${header}\n${placeholders.map((p) => `    - ${p}`).join('\n')}\n  Sustitúyelos por contenido real o ejecuta con ALLOW_PLACEHOLDERS=1 para previsualizar.`);
  }
}

if (errors.length) {
  console.error(`✗ Comprobación de contenido: ${errors.length} error(es)\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ Comprobación de contenido superada.');
