'use client';

import { Box } from '@mui/material';
import {
  TenantProvider,
  CoreThemeProvider,
  Navigation,
  About,
  Services,
  Process,
  Pricing,
  Footer,
} from '@bluebonnet-tech/core';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import DevicesIcon from '@mui/icons-material/Devices';
import InsightsIcon from '@mui/icons-material/Insights';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import tenantConfig from '../src/config/tenant';
import * as content from '../src/constants/content';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { useTranslation } from '../src/i18n/useTranslation';
import PortfolioHero from '../src/components/landing/PortfolioHero';
import ProjectsGrid from '../src/components/landing/ProjectsGrid';
import ContactSection from '../src/components/landing/ContactSection';
import LanguagePicker from '../src/components/ui/LanguagePicker';

const servicesIconMap = {
  Brush: BrushIcon,
  Code: CodeIcon,
  Devices: DevicesIcon,
  Insights: InsightsIcon,
  Support: SupportAgentIcon,
};

const socialIcons = [
  { label: 'GitHub', icon: GitHubIcon, href: 'https://github.com/aruizdevelops' },
  { label: 'LinkedIn', icon: LinkedInIcon, href: '#' },
];

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Skip to main content */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 16,
            left: 16,
            width: 'auto',
            height: 'auto',
            zIndex: 9999,
            bgcolor: 'background.paper',
            color: 'text.primary',
            p: 2,
            borderRadius: 1,
            boxShadow: 4,
          },
        }}
      >
        {t('a11y.skipToContent')}
      </Box>

      <LanguagePicker />

      <Navigation content={content.getNavigation(t)} />

      <main id="main-content">
        <PortfolioHero content={content.getHero(t)} />

        <About content={content.getAbout(t)} />

        <Services content={content.getServices(t)} iconMap={servicesIconMap} />

        <ProjectsGrid content={content.getWork(t)} t={t} />

        <Process content={content.getProcess(t)} />

        <Pricing content={content.getPricing(t)} />

        <ContactSection content={content.getContact(t)} />
      </main>

      <Footer content={content.getFooter(t)} socialIcons={socialIcons} />
    </>
  );
}

export default function Home() {
  return (
    <TenantProvider config={tenantConfig}>
      <CoreThemeProvider>
        <LanguageProvider>
          <HomePage />
        </LanguageProvider>
      </CoreThemeProvider>
    </TenantProvider>
  );
}
