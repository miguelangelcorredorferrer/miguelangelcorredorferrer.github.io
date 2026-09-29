// @ts-check
/**
 * Resaltado de código compatible con una CSP estricta (`style-src 'self'`).
 *
 * Shiki escribe los colores en atributos `style` en línea, que la CSP bloquearía.
 * Este transformer los sustituye por clases (`sl-<hex>` tema claro, `sd-<hex>` tema oscuro)
 * y `writeShikiCss()` genera en build la hoja con todas las clases posibles a partir
 * de los colores de los dos temas. Resultado: cero estilos en línea.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { bundledThemes } from 'shiki';

export const SHIKI_THEMES = /** @type {const} */ ({ light: 'github-light-default', dark: 'github-dark-default' });

const PREFIX = { light: 'sl', dark: 'sd' };
const hexId = (/** @type {string} */ hex) => hex.replace('#', '').toLowerCase();

/** @returns {import('shiki').ShikiTransformer} */
export function cspSafeTransformer() {
  return {
    name: 'csp-safe-classes',
    root(root) {
      /** @param {any} node */
      const visit = (node) => {
        if (node.type === 'element' && typeof node.properties?.style === 'string') {
          const classes = [];
          for (const decl of node.properties.style.split(';')) {
            const [rawKey, rawValue] = decl.split(':');
            const key = rawKey?.trim();
            const value = rawValue?.trim();
            if (!key || !value) continue;
            const m = key.match(/^--shiki-(light|dark)(-font-style|-font-weight|-text-decoration|-bg)?$/);
            if (!m) continue;
            const prefix = PREFIX[/** @type {'light'|'dark'} */ (m[1])];
            const kind = m[2];
            if (!kind && value.startsWith('#')) classes.push(`${prefix}-${hexId(value)}`);
            else if (kind === '-font-style' && value === 'italic') classes.push(`${prefix}-i`);
            else if (kind === '-font-weight' && value === 'bold') classes.push(`${prefix}-b`);
            else if (kind === '-text-decoration' && value.includes('underline')) classes.push(`${prefix}-u`);
            // -bg se ignora: el fondo lo pone el CSS del sitio.
          }
          delete node.properties.style;
          if (classes.length) {
            const prev = node.properties.class;
            node.properties.class = [prev, ...classes].filter(Boolean).join(' ');
          }
        }
        node.children?.forEach(visit);
      };
      visit(root);
    },
  };
}

/** Genera el CSS con una clase por cada color presente en los temas. */
export async function writeShikiCss(/** @type {string} */ outFile) {
  /** @type {string[]} */
  const rules = [];
  for (const [mode, name] of Object.entries(SHIKI_THEMES)) {
    const theme = (await bundledThemes[name]()).default;
    const colors = new Set(JSON.stringify(theme).match(/#[0-9a-fA-F]{3,8}\b/g) ?? []);
    const prefix = PREFIX[/** @type {'light'|'dark'} */ (mode)];
    const varName = `--c-${mode}`;
    for (const color of [...colors].sort()) rules.push(`.${prefix}-${hexId(color)}{${varName}:${color.toLowerCase()}}`);
    rules.push(
      `.${prefix}-i{--fs-${mode}:italic}`,
      `.${prefix}-b{--fw-${mode}:700}`,
      `.${prefix}-u{--td-${mode}:underline}`,
    );
  }
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `/* Generado por src/lib/shiki-csp.mjs. No editar. */\n${rules.join('\n')}\n`);
}
