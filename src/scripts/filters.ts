/**
 * Filtros con mejora progresiva. Sin JS se ven todos los elementos y el formulario
 * permanece oculto. Cada <select data-filter="clave"> filtra por el atributo
 * data-<clave> de los elementos [data-filter-item] (lista separada por espacios).
 */
for (const form of document.querySelectorAll<HTMLFormElement>('[data-filters]')) {
  const target = document.getElementById(form.dataset.target ?? '');
  if (!target) continue;
  const items = [...target.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const selects = [...form.querySelectorAll<HTMLSelectElement>('select[data-filter]')];
  const status = form.querySelector<HTMLElement>('[data-filter-status]');
  const empty = document.querySelector<HTMLElement>(`[data-filter-empty="${target.id}"]`);
  const template = status?.dataset.template ?? '{n}';
  const templateOne = status?.dataset.templateOne ?? template;

  const apply = () => {
    let visible = 0;
    for (const item of items) {
      const match = selects.every((select) => {
        const key = select.dataset.filter!;
        return !select.value || (item.dataset[key] ?? '').split(' ').includes(select.value);
      });
      item.hidden = !match;
      if (match) visible++;
    }
    if (status) status.textContent = (visible === 1 ? templateOne : template).replace('{n}', String(visible));
    if (empty) empty.hidden = visible > 0;
  };

  form.addEventListener('change', apply);
  form.addEventListener('reset', () => requestAnimationFrame(apply));
  form.addEventListener('submit', (event) => event.preventDefault());
  form.hidden = false;
  apply();
}
