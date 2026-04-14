'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function PricingCard({ tier, highlighted }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        position: 'relative',
        borderColor: highlighted
          ? (theme) => `${theme.palette.primary.main}40`
          : undefined,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: highlighted
            ? '0 12px 40px rgba(108, 99, 255, 0.25)'
            : '0 12px 40px rgba(0, 0, 0, 0.3)',
          borderColor: (theme) => `${theme.palette.primary.main}40`,
        },
      }}
    >
      {tier.badge && (
        <Chip
          label={tier.badge}
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            color: 'primary.contrastText',
          }}
        />
      )}
      <CardContent
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography variant="overline" component="p" sx={{ color: 'primary.main', mb: 1 }}>
          {tier.name}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 0.5 }}>
          <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
            {tier.price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /month
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tier.setup}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tier.description}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
          {tier.features.map((feature) => (
            <Stack direction="row" spacing={1.5} alignItems="flex-start" key={feature}>
              <CheckIcon
                sx={{ color: 'secondary.main', fontSize: 18, mt: '2px', flexShrink: 0 }}
              />
              <Typography variant="body2" color="text.secondary">
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          variant={highlighted ? 'contained' : 'outlined'}
          color="primary"
          fullWidth
          href={tier.ctaHref || '#contact'}
          size="large"
        >
          {tier.ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Pricing({ content }) {
  return (
    <Box
      component="section"
      id="pricing"
      sx={{ py: { xs: 10, md: 14 }, backgroundColor: 'background.paper' }}
    >
      <Container>
        <Stack alignItems="center" textAlign="center" spacing={2} sx={{ mb: 8 }}>
          <Typography variant="overline" component="p" sx={{ color: 'primary.main' }}>
            {content.overline}
          </Typography>
          <Typography variant="h2" component="h2">
            {content.headline}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600 }}
          >
            {content.subtitle}
          </Typography>
        </Stack>

        <Grid container spacing={4} justifyContent="center">
          {content.tiers.map((tier) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tier.name}>
              <PricingCard tier={tier} highlighted={tier.highlighted} />
            </Grid>
          ))}
        </Grid>

        {content.custom && (
          <Box
            sx={{
              mt: 8,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            <Typography variant="h5" component="h3" gutterBottom>
              {content.custom.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 560, mx: 'auto' }}>
              {content.custom.description}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              href={content.custom.ctaHref || '#contact'}
              endIcon={<ArrowForwardIcon />}
            >
              {content.custom.ctaLabel}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
