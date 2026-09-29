#!/usr/bin/env node
/**
 * Genera la imagen por defecto para vistas previas (LinkedIn, etc.): 1200×630 PNG,
 * y el icono táctil de 180×180. Uso: npm run og
 *
 * Lee el nombre de src/data/profile.yaml. Los textos se rasterizan con las fuentes
 * del sistema; ejecútalo en local y versiona el resultado (public/og/default.png).
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const profile = parse(readFileSync(join(ROOT, 'src/data/profile.yaml'), 'utf8'));

// Subtítulo fijo y neutro. Cámbialo aquí si quieres otro texto en la tarjeta.
const SUBTITLE = 'Portfolio · Seguridad · DevSecOps · Infraestructura';

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0d1015"/>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#252b35"/>
  <g font-family="JetBrains Mono, Consolas, Menlo, monospace" font-size="30" fill="#5fd4c0">
    <text x="96" y="220">~$ whoami</text>
  </g>
  <g font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" fill="#e5e8ec">
    <text x="96" y="320" font-size="72" font-weight="700" letter-spacing="-1.5">${escape(profile.name)}</text>
    <text x="96" y="392" font-size="32" fill="#9ba4b1">${escape(SUBTITLE)}</text>
  </g>
  <rect x="96" y="470" width="120" height="4" rx="2" fill="#5fd4c0"/>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180"><rect width="32" height="32" fill="#0d1015"/><path d="M8 11l5 5-5 5" fill="none" stroke="#5fd4c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 21h8" stroke="#e5e8ec" stroke-width="2.5" stroke-linecap="round"/></svg>`;

mkdirSync(join(ROOT, 'public/og'), { recursive: true });
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(join(ROOT, 'public/og/default.png'));
await sharp(Buffer.from(icon), { density: 450 }).resize(180, 180).png().toFile(join(ROOT, 'public/apple-touch-icon.png'));
console.log('✓ public/og/default.png (1200×630) y public/apple-touch-icon.png (180×180)');
