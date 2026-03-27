/**
 * Project / case study data for the Bluebonnet Tech portfolio.
 * Each project maps to a tenant app built on the -core platform.
 * Text fields use translation keys — resolve via t() at render time.
 */

export const PROJECTS = [
  {
    id: 'tropikala-smoothie',
    slug: 'tropikala-smoothie',
    nameKey: 'projects.tropikala.name',
    summaryKey: 'projects.tropikala.summary',
    appTypeKey: 'projects.tropikala.appType',
    businessProblemKey: 'projects.tropikala.businessProblem',
    overviewKey: 'projects.tropikala.overview',
    challengeKey: 'projects.tropikala.challenge',
    solutionKey: 'projects.tropikala.solution',
    featureKeys: [
      'projects.tropikala.feature1',
      'projects.tropikala.feature2',
      'projects.tropikala.feature3',
      'projects.tropikala.feature4',
      'projects.tropikala.feature5',
      'projects.tropikala.feature6',
    ],
    techStack: ['Next.js', 'React', 'Material UI', 'Emotion', 'i18n', '@bluebonnet-tech/core'],
    designHighlightKeys: [
      'projects.tropikala.design1',
      'projects.tropikala.design2',
    ],
    mobileNotesKey: 'projects.tropikala.mobileNotes',
    futureKeys: [
      'projects.tropikala.future1',
      'projects.tropikala.future2',
      'projects.tropikala.future3',
    ],
    images: {
      thumbnail: '/images/projects/tropikala/thumbnail.png',
      hero: '/images/projects/tropikala/hero.png',
      gallery: [
        '/images/projects/tropikala/landing.png',
        '/images/projects/tropikala/menu.png',
        '/images/projects/tropikala/admin.png',
        '/images/projects/tropikala/mobile.png',
      ],
    },
    accentColor: '#FF6B4A',
    secondaryColor: '#00B4A0',
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
