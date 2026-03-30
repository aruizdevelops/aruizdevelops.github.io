'use client';

import { Box, Container, Typography, Grid, Stack } from '@mui/material';

export default function Process({ content }) {
  return (
    <Box
      component="section"
      id="process"
      sx={{
        py: { xs: 10, md: 14 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'primary.main', mb: 2 }}
          >
            {content.overline}
          </Typography>
          <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
            {content.headline}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            {content.subtitle}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {content.steps.map((step) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.number}>
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  component="span"
                  sx={{
                    fontWeight: 800,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: 0.85,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h4" component="h3">
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
