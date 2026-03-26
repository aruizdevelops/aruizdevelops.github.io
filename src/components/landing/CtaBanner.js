'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function CtaBanner({ content }) {
  return (
    <Box
      component="section"
      id="contact"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `radial-gradient(ellipse at 50% 100%, ${theme.palette.primary.main}1A 0%, transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" spacing={3}>
          <Typography variant="h2" component="h2">
            {content.headline}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {content.subtitle}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="#contact"
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2 }}
          >
            {content.buttonLabel}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {content.note}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
