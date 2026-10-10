/** Textos de interfaz en español (idioma por defecto). */
export const es = {
  meta: {
    siteDescription:
      'Portfolio profesional: proyectos de seguridad, DevSecOps e infraestructura, y writeups de máquinas retiradas.',
  },
  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNav: 'Navegación principal',
    menu: 'Menú',
    themeToDark: 'Cambiar a tema oscuro',
    themeToLight: 'Cambiar a tema claro',
    switchLanguage: 'Read in English',
    externalLink: '(abre en otra pestaña)',
  },
  nav: {
    home: 'Inicio',
    projects: 'Proyectos',
    writeups: 'Writeups',
    about: 'Sobre mí',
    certifications: 'Certificaciones',
    downloadCv: 'Descargar CV',
    contact: 'Contacto',
  },
  lang: {
    code: 'ES',
    other: 'EN',
  },
  home: {
    currently: 'Actualmente',
    aboutTitle: 'Sobre mí',
    featuredTitle: 'Proyectos destacados',
    latestWriteupsTitle: 'Últimos writeups',
    credentialsTitle: 'Certificaciones e idiomas',
    contactTitle: 'Contacto',
    contactText: 'La forma más rápida de contactarme es LinkedIn. También puedes escribirme por correo.',
    seeAll: 'Ver todos',
    seeDetails: 'Ver detalle',
    emptyProjects: 'Todavía no hay proyectos publicados.',
    emptyWriteups: 'Todavía no hay writeups publicados.',
  },
  contact: {
    showEmail: 'Mostrar correo',
    emailFallback: 'El correo se muestra con JavaScript activado; si no, escríbeme por LinkedIn.',
  },
  filters: {
    legend: 'Filtrar',
    category: 'Categoría',
    tag: 'Etiqueta',
    platform: 'Plataforma',
    difficulty: 'Dificultad',
    all: 'Todas',
    reset: 'Quitar filtros',
    results: (n: number) => (n === 1 ? '1 resultado' : `${n} resultados`),
    empty: 'Ningún resultado con estos filtros.',
  },
  projects: {
    title: 'Proyectos',
    intro: 'Proyectos de DevSecOps, infraestructura y seguridad: problema, arquitectura, decisiones y evidencia.',
    categories: { devsecops: 'DevSecOps / Infraestructura', security: 'Seguridad' },
    status: { 'in-progress': 'En curso', done: 'Terminado' },
    repo: 'Repositorio',
    demo: 'Demo',
    document: 'Documento',
    downloadPdf: 'Descargar PDF',
    metrics: 'Métricas',
    back: 'Todos los proyectos',
    date: 'Fecha',
    stateLabel: 'Estado',
    categoryLabel: 'Categoría',
  },
  writeups: {
    title: 'Writeups',
    intro: 'Resoluciones de máquinas retiradas, con la visión defensiva de cada una. Sin flags ni contraseñas.',
    difficulty: { easy: 'Fácil', medium: 'Media', hard: 'Difícil', insane: 'Insana' },
    os: 'Sistema',
    platform: 'Plataforma',
    difficultyLabel: 'Dificultad',
    readingLabel: 'Lectura',
    readingTime: (min: number) => `${min} min de lectura`,
    toc: 'En esta página',
    copy: 'Copiar',
    copied: 'Copiado',
    copyLabel: 'Copiar código al portapapeles',
    back: 'Todos los writeups',
    retiredNote: 'Máquina retirada. Este writeup no incluye flags ni credenciales.',
  },
  about: {
    title: 'Sobre mí',
    experience: 'Experiencia',
    education: 'Formación',
    present: 'actualidad',
    duration: (months: number) => {
      const y = Math.floor(months / 12);
      const m = months % 12;
      const ys = y ? (y === 1 ? '1 año' : `${y} años`) : '';
      const ms = m ? (m === 1 ? '1 mes' : `${m} meses`) : '';
      return [ys, ms].filter(Boolean).join(' y ') || '1 mes';
    },
    stack: 'Stack',
  },
  certs: {
    title: 'Certificaciones',
    intro: 'Certificaciones obtenidas y en curso, con enlace de verificación cuando existe.',
    status: { obtained: 'Obtenida', 'in-progress': 'En curso', planned: 'Planificada' },
    credential: 'Ver credencial',
    issued: 'Expedición',
    expires: 'Vence',
    empty: 'Todavía no hay certificaciones publicadas.',
    languagesTitle: 'Idiomas',
    levels: { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', native: 'Nativo' },
  },
  fallback: {
    /** Etiqueta cuando la entrada solo existe en otro idioma. */
    onlyIn: { es: 'Solo en español', en: 'Solo en inglés' },
  },
  notFound: {
    title: 'Página no encontrada',
    text: 'La página que buscas no existe o se ha movido.',
    back: 'Volver al inicio',
  },
  footer: {
    note: 'Sitio estático, sin rastreadores.',
  },
};

export type UIStrings = typeof es;
