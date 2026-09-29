import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, writeupSchema } from './content/schemas';

// El id de cada entrada es "<idioma>/<slug>", p. ej. "es/mi-proyecto".
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '{es,en}/*.md' }),
  schema: ({ image }) => projectSchema(image),
});

const writeups = defineCollection({
  loader: glob({ base: './src/content/writeups', pattern: '{es,en}/*.md' }),
  schema: writeupSchema,
});

export const collections = { projects, writeups };
