'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { TenantProvider, CoreThemeProvider } from '@bluebonnet-tech/core';
import tenantConfig from '../src/config/tenant';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { useTranslation } from '../src/i18n/useTranslation';

function NotFoundContent() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Stack alignItems="center" textAlign="center" spacing={3}>
          <Typography
            variant="h1"
            component="span"
            aria-hidden="true"
            sx={{
              display: 'block',
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '8rem',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            404
          </Typography>
          <Typography variant="h3" component="h1">
            {t('notFound.headline')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('notFound.subtitle')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
          >
            {t('notFound.cta')}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default function NotFound() {
  return (
    <TenantProvider config={tenantConfig}>
      <CoreThemeProvider>
        <LanguageProvider>
          <NotFoundContent />
        </LanguageProvider>
      </CoreThemeProvider>
    </TenantProvider>
  );
}
