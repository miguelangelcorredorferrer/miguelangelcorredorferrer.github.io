import type { APIRoute } from 'astro';
import { profile } from '@/lib/data';
import { withBase } from '@/lib/urls';

/**
 * RFC 9116. Se regenera en cada build con caducidad a un año vista:
 * si pasa más de un año sin desplegar, el archivo caduca (es lo esperado).
 * Contacto: LinkedIn/GitHub, porque el correo no se publica en texto plano.
 */
export const GET: APIRoute = ({ site }) => {
  const contacts = [profile.links.linkedin, profile.links.github].filter(Boolean);
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const lines = [
    ...contacts.map((c) => `Contact: ${c}`),
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: es, en',
    `Canonical: ${new URL(withBase('/.well-known/security.txt'), site).href}`,
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
