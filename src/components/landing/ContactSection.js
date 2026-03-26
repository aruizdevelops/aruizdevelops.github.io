'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function ContactSection({ content }) {
  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: { xs: 12, md: 18 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `radial-gradient(ellipse at 50% 80%, ${theme.palette.primary.main}12 0%, transparent 55%), radial-gradient(ellipse at 20% 20%, ${theme.palette.secondary.main}08 0%, transparent 40%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" spacing={3}>
          <Typography variant="overline" component="p" sx={{ color: 'primary.main' }}>
            {content.overline}
          </Typography>

          <Typography variant="h2" component="h2">
            {content.headline}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
            {content.subtitle}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            href={`mailto:${content.email}`}
            startIcon={<EmailIcon />}
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2 }}
          >
            {content.cta}
          </Button>

          <Typography variant="caption" color="text.secondary">
            {content.note}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
