'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Logo,
  TenantProvider,
  CoreThemeProvider,
} from '@bluebonnet-tech/core';

import tenantConfig from '../../src/config/tenant';
import { LanguageProvider } from '../../src/i18n/LanguageContext';
import { useTranslation } from '../../src/i18n/useTranslation';
import LanguagePicker from '../../src/components/ui/LanguagePicker';
import {
  buildUnsubscribeMailto,
  confirmUnsubscribe,
  hasLocalUnsubscribe,
  isValidEmail,
  normalizeBusinessName,
  normalizeEmail,
  openMailto,
} from '../../src/utils/unsubscribe';

function UnsubscribeContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState('ready');
  const [usedMailto, setUsedMailto] = useState(false);

  const email = normalizeEmail(searchParams.get('e'));
  const business = normalizeBusinessName(searchParams.get('b'));

  useEffect(() => {
    setHydrated(true);
  }, []);

  const view = useMemo(() => {
    if (!hydrated) return 'loading';
    if (!email) return 'missing';
    if (!isValidEmail(email)) return 'invalid';
    if (status === 'success') return 'success';
    if (hasLocalUnsubscribe(email)) return 'already';
    return 'confirm';
  }, [hydrated, email, status]);

  const handleConfirm = async () => {
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const result = await confirmUnsubscribe({ email, business });
      setUsedMailto(result.usedMailto);
      setStatus('success');
      if (result.mailtoHref) {
        window.requestAnimationFrame(() => openMailto(result.mailtoHref));
      }
    } catch {
      setUsedMailto(true);
      setStatus('success');
      openMailto(buildUnsubscribeMailto({ email, business }));
    }
  };

  const mailtoHref = email
    ? buildUnsubscribeMailto({ email, business })
    : undefined;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 10, md: 12 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `radial-gradient(ellipse at 30% 20%, ${theme.palette.primary.main}18 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${theme.palette.secondary.main}10 0%, transparent 45%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <LanguagePicker />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack
              alignItems="center"
              textAlign="center"
              spacing={2.5}
              aria-live="polite"
            >
              <Logo size="medium" />

              {view === 'loading' && (
                <Box sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              )}

              {view === 'confirm' && (
                <>
                  <Typography
                    variant="overline"
                    component="p"
                    sx={{ color: 'primary.main' }}
                  >
                    {t('unsubscribe.overline')}
                  </Typography>
                  <Typography variant="h3" component="h1">
                    {t('unsubscribe.headline')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('unsubscribe.body')}
                  </Typography>
                  <EmailDetails email={email} business={business} t={t} />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleConfirm}
                    disabled={status === 'submitting'}
                    startIcon={
                      status === 'submitting' ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <UnsubscribeIcon />
                      )
                    }
                    sx={{ mt: 1 }}
                  >
                    {status === 'submitting'
                      ? t('unsubscribe.submitting')
                      : t('unsubscribe.confirm')}
                  </Button>
                </>
              )}

              {(view === 'success' || view === 'already') && (
                <>
                  <MarkEmailReadIcon
                    sx={{ fontSize: 48, color: 'success.main' }}
                    aria-hidden="true"
                  />
                  <Typography variant="h3" component="h1">
                    {view === 'already'
                      ? t('unsubscribe.alreadyHeadline')
                      : t('unsubscribe.successHeadline')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {view === 'already'
                      ? t('unsubscribe.alreadyBody', { email })
                      : t('unsubscribe.successBody', { email })}
                  </Typography>
                  {usedMailto && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {t('unsubscribe.mailtoHint')}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        href={mailtoHref}
                      >
                        {t('unsubscribe.mailtoCta')}
                      </Button>
                    </>
                  )}
                  <HomeButton label={t('unsubscribe.home')} />
                </>
              )}

              {(view === 'missing' || view === 'invalid') && (
                <>
                  <Typography
                    variant="overline"
                    component="p"
                    sx={{ color: 'primary.main' }}
                  >
                    {t('unsubscribe.overline')}
                  </Typography>
                  <Typography variant="h3" component="h1">
                    {view === 'missing'
                      ? t('unsubscribe.missingHeadline')
                      : t('unsubscribe.invalidHeadline')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {view === 'missing'
                      ? t('unsubscribe.missingBody')
                      : t('unsubscribe.invalidBody')}
                  </Typography>
                  <HomeButton label={t('unsubscribe.home')} />
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function EmailDetails({ email, business, t }) {
  return (
    <Box
      sx={{
        width: '100%',
        py: 2,
        px: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.02)',
        textAlign: 'left',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {t('unsubscribe.emailLabel')}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, wordBreak: 'break-word' }}
      >
        {email}
      </Typography>
      {business ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('unsubscribe.businessLabel')}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {business}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

function HomeButton({ label }) {
  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      component={Link}
      href="/"
      startIcon={<ArrowBackIcon />}
    >
      {label}
    </Button>
  );
}

export default function UnsubscribeClient() {
  return (
    <TenantProvider config={tenantConfig}>
      <CoreThemeProvider>
        <LanguageProvider>
          <UnsubscribeContent />
        </LanguageProvider>
      </CoreThemeProvider>
    </TenantProvider>
  );
}
