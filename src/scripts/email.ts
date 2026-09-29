/**
 * Correo con mejora progresiva: el HTML solo contiene fragmentos codificados
 * (usuario y dominio invertidos y en base64). Al pulsar el botón se compone el enlace.
 */
const decode = (value: string) => atob(value).split('').reverse().join('');

for (const container of document.querySelectorAll<HTMLElement>('[data-email]')) {
  const { u, d } = container.dataset;
  const button = container.querySelector<HTMLButtonElement>('button');
  const fallback = container.querySelector<HTMLElement>('[data-email-fallback]');
  if (!u || !d || !button) continue;

  fallback?.setAttribute('hidden', '');
  button.hidden = false;
  button.addEventListener(
    'click',
    () => {
      const address = `${decode(u)}@${decode(d)}`;
      const link = document.createElement('a');
      link.href = `mailto:${address}`;
      link.textContent = address;
      link.className = 'btn';
      button.replaceWith(link);
      link.focus();
    },
    { once: true },
  );
}
