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
  {
    id: 'iron-oak-barbershop',
    slug: 'iron-oak-barbershop',
    nameKey: 'projects.ironoak.name',
    summaryKey: 'projects.ironoak.summary',
    appTypeKey: 'projects.ironoak.appType',
    businessProblemKey: 'projects.ironoak.businessProblem',
    overviewKey: 'projects.ironoak.overview',
    challengeKey: 'projects.ironoak.challenge',
    solutionKey: 'projects.ironoak.solution',
    featureKeys: [
      'projects.ironoak.feature1',
      'projects.ironoak.feature2',
      'projects.ironoak.feature3',
      'projects.ironoak.feature4',
      'projects.ironoak.feature5',
      'projects.ironoak.feature6',
    ],
    techStack: ['Next.js', 'React', 'Material UI', 'Emotion', 'Playwright', '@bluebonnet-tech/core'],
    designHighlightKeys: [
      'projects.ironoak.design1',
      'projects.ironoak.design2',
    ],
    mobileNotesKey: 'projects.ironoak.mobileNotes',
    futureKeys: [
      'projects.ironoak.future1',
      'projects.ironoak.future2',
      'projects.ironoak.future3',
    ],
    images: {
      thumbnail: '/images/projects/iron-oak/thumbnail.png',
      hero: '/images/projects/iron-oak/hero.png',
      gallery: [
        '/images/projects/iron-oak/landing.png',
        '/images/projects/iron-oak/services.png',
        '/images/projects/iron-oak/booking-service.png',
        '/images/projects/iron-oak/booking-time.png',
        '/images/projects/iron-oak/booking-confirm.png',
        '/images/projects/iron-oak/confirmation.png',
        '/images/projects/iron-oak/mobile.png',
      ],
    },
    accentColor: '#C9A96E',
    secondaryColor: '#F5E6D3',
    demoUrl: 'https://aruizdevelops.github.io/bluebonnet-tech-tenant-barbershop/',
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}

export function getAllProjectSlugs() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}
