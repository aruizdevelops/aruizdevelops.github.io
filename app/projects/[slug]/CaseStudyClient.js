'use client';

import { useParams } from 'next/navigation';
import { Container, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import {
  TenantProvider,
  CoreThemeProvider,
  Navigation,
  Footer,
} from '@bluebonnet-tech/core';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import tenantConfig from '../../../src/config/tenant';
import * as content from '../../../src/constants/content';
import { getProjectBySlug } from '../../../src/constants/projects';
import { LanguageProvider } from '../../../src/i18n/LanguageContext';
import { useTranslation } from '../../../src/i18n/useTranslation';
import CaseStudyLayout from '../../../src/components/projects/CaseStudyLayout';

const socialIcons = [
  { label: 'GitHub', icon: GitHubIcon, href: 'https://github.com/aruizdevelops' },
  { label: 'LinkedIn', icon: LinkedInIcon, href: '#' },
];

function CaseStudyPage() {
  const { t } = useTranslation();
  const params = useParams();
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return (
      <>
        <Navigation content={content.getNavigation(t)} />
        <Container sx={{ py: 20, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 3 }}>
            {t('notFound.headline')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('notFound.subtitle')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
          >
            {t('notFound.cta')}
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation content={content.getNavigation(t)} />
      <CaseStudyLayout project={project} t={t} />
      <Footer content={content.getFooter(t)} socialIcons={socialIcons} />
    </>
  );
}

export default function CaseStudyClient() {
  return (
    <TenantProvider config={tenantConfig}>
      <CoreThemeProvider>
        <LanguageProvider>
          <CaseStudyPage />
        </LanguageProvider>
      </CoreThemeProvider>
    </TenantProvider>
  );
}
