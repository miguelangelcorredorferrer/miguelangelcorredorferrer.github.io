/** Añade un botón "Copiar" a cada bloque de código. Sin JS no aparece. */
for (const article of document.querySelectorAll<HTMLElement>('[data-copy-code]')) {
  const { copyText = 'Copy', copiedText = 'Copied', copyLabel = 'Copy code' } = article.dataset;

  for (const pre of article.querySelectorAll('pre')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.replaceWith(wrapper);
    wrapper.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = copyText;
    button.setAttribute('aria-label', copyLabel);
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
        button.textContent = copiedText;
        button.dataset.copied = '';
        setTimeout(() => {
          button.textContent = copyText;
          delete button.dataset.copied;
        }, 1600);
      } catch {
        /* portapapeles no disponible (contexto no seguro o permiso denegado) */
      }
    });
    wrapper.append(button);
  }
}
