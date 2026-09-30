import type { ImageMetadata } from 'astro';

/**
 * Imágenes referenciadas por nombre de archivo desde los YAML de src/data/.
 * Se procesan con astro:assets (AVIF/WebP, dimensiones fijas).
 */
const glob = (files: Record<string, ImageMetadata>, dir: string) => (name?: string) =>
  name ? files[`/src/assets/${dir}/${name}`] : undefined;

export const profileImage = glob(
  import.meta.glob<ImageMetadata>('/src/assets/profile/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' }),
  'profile',
);

export const logoImage = glob(
  import.meta.glob<ImageMetadata>('/src/assets/logos/*.{png,jpg,jpeg,webp,avif,svg}', { eager: true, import: 'default' }),
  'logos',
);

export const badgeImage = glob(
  import.meta.glob<ImageMetadata>('/src/assets/badges/*.{png,jpg,jpeg,webp,avif,svg}', { eager: true, import: 'default' }),
  'badges',
);
