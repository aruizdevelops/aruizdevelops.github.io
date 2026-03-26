/**
 * Project / case study data for the Bluebonnet Tech portfolio.
 * Each project maps to a tenant app built on the -core platform.
 * Text fields use translation keys — resolve via t() at render time.
 */

export const PROJECTS = [
  {
    id: 'fruteria-del-sol',
    slug: 'fruteria-del-sol',
    nameKey: 'projects.fruteria.name',
    summaryKey: 'projects.fruteria.summary',
    appTypeKey: 'projects.fruteria.appType',
    businessProblemKey: 'projects.fruteria.businessProblem',
    overviewKey: 'projects.fruteria.overview',
    challengeKey: 'projects.fruteria.challenge',
    solutionKey: 'projects.fruteria.solution',
    featureKeys: [
      'projects.fruteria.feature1',
      'projects.fruteria.feature2',
      'projects.fruteria.feature3',
      'projects.fruteria.feature4',
      'projects.fruteria.feature5',
    ],
    techStack: ['Next.js', 'React', 'Material UI', 'Emotion', 'i18n'],
    designHighlightKeys: [
      'projects.fruteria.design1',
      'projects.fruteria.design2',
    ],
    mobileNotesKey: 'projects.fruteria.mobileNotes',
    futureKeys: [
      'projects.fruteria.future1',
      'projects.fruteria.future2',
      'projects.fruteria.future3',
    ],
    images: {
      thumbnail: '/images/projects/fruteria/thumbnail.png',
      hero: '/images/projects/fruteria/hero.png',
      gallery: [
        '/images/projects/fruteria/landing.png',
        '/images/projects/fruteria/menu.png',
        '/images/projects/fruteria/mobile.png',
      ],
    },
    accentColor: '#E07830',
    secondaryColor: '#43A047',
    demoUrl: 'https://aruizdevelops.github.io/bluebonnet-tech-tenant-demo/',
  },
  {
    id: 'sage-stone',
    slug: 'sage-stone',
    nameKey: 'projects.sage.name',
    summaryKey: 'projects.sage.summary',
    appTypeKey: 'projects.sage.appType',
    businessProblemKey: 'projects.sage.businessProblem',
    overviewKey: 'projects.sage.overview',
    challengeKey: 'projects.sage.challenge',
    solutionKey: 'projects.sage.solution',
    featureKeys: [
      'projects.sage.feature1',
      'projects.sage.feature2',
      'projects.sage.feature3',
      'projects.sage.feature4',
      'projects.sage.feature5',
      'projects.sage.feature6',
    ],
    techStack: ['Next.js', 'React', 'Material UI', 'Emotion', 'i18n', 'Context API'],
    designHighlightKeys: [
      'projects.sage.design1',
      'projects.sage.design2',
    ],
    mobileNotesKey: 'projects.sage.mobileNotes',
    futureKeys: [
      'projects.sage.future1',
      'projects.sage.future2',
      'projects.sage.future3',
      'projects.sage.future4',
    ],
    images: {
      thumbnail: '/images/projects/sage-stone/thumbnail.png',
      hero: '/images/projects/sage-stone/hero.png',
      gallery: [
        '/images/projects/sage-stone/landing.png',
        '/images/projects/sage-stone/booking.png',
        '/images/projects/sage-stone/admin.png',
        '/images/projects/sage-stone/mobile.png',
      ],
    },
    accentColor: '#7C9A6E',
    secondaryColor: '#B8977E',
    demoUrl: 'https://aruizdevelops.github.io/bluebonnet-tech-tenant-sage-stone/',
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}

export function getAllProjectSlugs() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}
