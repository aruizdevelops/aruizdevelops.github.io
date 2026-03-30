'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Hero({ content }) {
  return (
    <Box
      component="section"
      id="hero"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `radial-gradient(ellipse at 50% 0%, ${theme.palette.primary.main}1F 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, ${theme.palette.secondary.main}0F 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" spacing={4}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'primary.main' }}
          >
            {content.overline}
          </Typography>

          <Typography variant="h1" component="h1" color="text.primary">
            {content.headline}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 560, mx: 'auto', fontSize: '1.125rem' }}
          >
            {content.subtitle}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ pt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="#contact"
              endIcon={<ArrowForwardIcon />}
            >
              {content.primaryCta}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              href="#services"
            >
              {content.secondaryCta}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
