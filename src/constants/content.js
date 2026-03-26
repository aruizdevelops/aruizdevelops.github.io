/**
 * Content for the Bluebonnet Tech portfolio landing page.
 * Each export returns the object shape that core components expect.
 */

export function getNavigation(t) {
  return {
    brand: 'Bluebonnet Tech',
    links: [
      { label: t('nav.about'), href: '/#about' },
      { label: t('nav.services'), href: '/#services' },
      { label: t('nav.work'), href: '/#work' },
      { label: t('nav.process'), href: '/#process' },
    ],
    ctaLabel: t('nav.contact'),
  };
}

export function getHero(t) {
  return {
    overline: t('hero.overline'),
    headline: t('hero.headline'),
    subtitle: t('hero.subtitle'),
    primaryCta: t('hero.primaryCta'),
    secondaryCta: t('hero.secondaryCta'),
    roles: [
      t('hero.roles.0'),
      t('hero.roles.1'),
      t('hero.roles.2'),
      t('hero.roles.3'),
    ],
  };
}

export function getAbout(t) {
  return {
    overline: t('about.overline'),
    headline: t('about.headline'),
    description: t('about.description'),
    highlights: [
      t('about.highlight1'),
      t('about.highlight2'),
      t('about.highlight3'),
      t('about.highlight4'),
    ],
  };
}

export function getServices(t) {
  return {
    overline: t('services.overline'),
    headline: t('services.headline'),
    subtitle: t('services.subtitle'),
    items: [
      {
        title: t('services.uiux.title'),
        description: t('services.uiux.description'),
        icon: 'Brush',
      },
      {
        title: t('services.web.title'),
        description: t('services.web.description'),
        icon: 'Code',
      },
      {
        title: t('services.mobile.title'),
        description: t('services.mobile.description'),
        icon: 'Devices',
      },
      {
        title: t('services.demos.title'),
        description: t('services.demos.description'),
        icon: 'Insights',
      },
      {
        title: t('services.support.title'),
        description: t('services.support.description'),
        icon: 'Support',
      },
    ],
  };
}

export function getWork(t) {
  return {
    overline: t('work.overline'),
    headline: t('work.headline'),
    subtitle: t('work.subtitle'),
  };
}

export function getProcess(t) {
  return {
    overline: t('process.overline'),
    headline: t('process.headline'),
    subtitle: t('process.subtitle'),
    steps: [
      {
        number: '01',
        title: t('process.discover.title'),
        description: t('process.discover.description'),
      },
      {
        number: '02',
        title: t('process.design.title'),
        description: t('process.design.description'),
      },
      {
        number: '03',
        title: t('process.build.title'),
        description: t('process.build.description'),
      },
      {
        number: '04',
        title: t('process.launch.title'),
        description: t('process.launch.description'),
      },
    ],
  };
}

export function getContact(t) {
  return {
    overline: t('contact.overline'),
    headline: t('contact.headline'),
    subtitle: t('contact.subtitle'),
    cta: t('contact.cta'),
    note: t('contact.note'),
    email: t('contact.email'),
  };
}

export function getCta(t) {
  return {
    headline: t('contact.headline'),
    subtitle: t('contact.subtitle'),
    buttonLabel: t('contact.cta'),
    note: t('contact.note'),
  };
}

export function getFooter(t) {
  return {
    brand: 'Bluebonnet Tech',
    tagline: t('footer.tagline'),
    columns: [
      {
        title: t('footer.quickLinks'),
        links: [
          { label: t('nav.about'), href: '#about' },
          { label: t('nav.services'), href: '#services' },
          { label: t('nav.work'), href: '#work' },
          { label: t('nav.process'), href: '#process' },
        ],
      },
      {
        title: t('footer.projectsTitle'),
        links: [
          { label: 'Fruteria del Sol', href: '/projects/fruteria-del-sol' },
          { label: 'Sage & Stone Wellness', href: '/projects/sage-stone' },
        ],
      },
      {
        title: t('footer.connectTitle'),
        links: [
          { label: t('contact.email'), href: 'mailto:ruiz.allen.development@gmail.com' },
          { label: 'GitHub', href: 'https://github.com/aruizdevelops' },
          { label: 'LinkedIn', href: '#' },
        ],
      },
    ],
    copyright: t('footer.copyright'),
    legalLinks: [
      { label: t('footer.privacyPolicy'), href: '#' },
      { label: t('footer.termsOfService'), href: '#' },
    ],
  };
}
