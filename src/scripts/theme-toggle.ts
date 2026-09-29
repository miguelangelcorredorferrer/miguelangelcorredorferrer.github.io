/** Botón de tema: alterna claro/oscuro y recuerda la elección. Sin JS no se muestra. */
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: light)');

const current = (): 'light' | 'dark' => {
  const forced = root.getAttribute('data-theme');
  if (forced === 'light' || forced === 'dark') return forced;
  return media.matches ? 'light' : 'dark';
};

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  const sync = () => {
    const theme = current();
    button.setAttribute('aria-label', theme === 'dark' ? button.dataset.labelLight! : button.dataset.labelDark!);
    button.dataset.current = theme;
  };
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* almacenamiento no disponible: el cambio dura hasta recargar */
    }
    sync();
  });
  media.addEventListener('change', sync);
  sync();
  button.hidden = false;
}
