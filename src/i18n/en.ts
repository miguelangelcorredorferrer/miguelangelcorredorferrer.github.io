import type { UIStrings } from './es';

/** Interface strings in English. Must mirror es.ts (the type enforces it). */
export const en: UIStrings = {
  meta: {
    siteDescription:
      'Professional portfolio: security, DevSecOps and infrastructure projects, plus writeups of retired machines.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    menu: 'Menu',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
    switchLanguage: 'Leer en español',
    externalLink: '(opens in a new tab)',
  },
  nav: {
    home: 'Home',
    projects: 'Projects',
    writeups: 'Writeups',
    about: 'About',
    certifications: 'Certifications',
    downloadCv: 'Download CV',
    contact: 'Contact',
  },
  lang: {
    code: 'EN',
    other: 'ES',
  },
  home: {
    currently: 'Currently',
    aboutTitle: 'About',
    featuredTitle: 'Featured projects',
    latestWriteupsTitle: 'Latest writeups',
    credentialsTitle: 'Certifications and languages',
    contactTitle: 'Contact',
    contactText: 'LinkedIn is the fastest way to reach me. You can also send me an email.',
    seeAll: 'See all',
    seeDetails: 'See details',
    emptyProjects: 'No projects published yet.',
    emptyWriteups: 'No writeups published yet.',
  },
  contact: {
    showEmail: 'Show email',
    emailFallback: 'Email is shown with JavaScript enabled; otherwise, reach me on LinkedIn.',
  },
  filters: {
    legend: 'Filter',
    category: 'Category',
    tag: 'Tag',
    platform: 'Platform',
    difficulty: 'Difficulty',
    all: 'All',
    reset: 'Clear filters',
    results: (n: number) => (n === 1 ? '1 result' : `${n} results`),
    empty: 'No results match these filters.',
  },
  projects: {
    title: 'Projects',
    intro: 'DevSecOps, infrastructure and security projects: problem, architecture, decisions and evidence.',
    categories: { devsecops: 'DevSecOps / Infrastructure', security: 'Security' },
    status: { 'in-progress': 'In progress', done: 'Done' },
    repo: 'Repository',
    demo: 'Demo',
    metrics: 'Metrics',
    back: 'All projects',
    date: 'Date',
    stateLabel: 'Status',
    categoryLabel: 'Category',
  },
  writeups: {
    title: 'Writeups',
    intro: 'Walkthroughs of retired machines, each with its defensive view. No flags or passwords.',
    difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard', insane: 'Insane' },
    os: 'OS',
    platform: 'Platform',
    difficultyLabel: 'Difficulty',
    readingLabel: 'Reading',
    readingTime: (min: number) => `${min} min read`,
    toc: 'On this page',
    copy: 'Copy',
    copied: 'Copied',
    copyLabel: 'Copy code to clipboard',
    back: 'All writeups',
    retiredNote: 'Retired machine. This writeup contains no flags or credentials.',
  },
  about: {
    title: 'About',
    experience: 'Experience',
    education: 'Education',
    present: 'present',
    duration: (months: number) => {
      const y = Math.floor(months / 12);
      const m = months % 12;
      const ys = y ? (y === 1 ? '1 yr' : `${y} yrs`) : '';
      const ms = m ? (m === 1 ? '1 mo' : `${m} mos`) : '';
      return [ys, ms].filter(Boolean).join(' ') || '1 mo';
    },
    stack: 'Stack',
  },
  certs: {
    title: 'Certifications',
    intro: 'Certifications obtained and in progress, with a verification link where available.',
    status: { obtained: 'Obtained', 'in-progress': 'In progress', planned: 'Planned' },
    credential: 'View credential',
    issued: 'Issued',
    expires: 'Expires',
    empty: 'No certifications published yet.',
    languagesTitle: 'Languages',
    levels: { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', native: 'Native' },
  },
  fallback: {
    onlyIn: { es: 'Spanish only', en: 'English only' },
  },
  notFound: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has moved.',
    back: 'Back to home',
  },
  footer: {
    note: 'Static site, no trackers.',
  },
};
