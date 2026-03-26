'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function useTypingEffect(words, typingSpeed = 100, pauseDuration = 2000) {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && displayed === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayed(
            isDeleting
              ? currentWord.substring(0, displayed.length - 1)
              : currentWord.substring(0, displayed.length + 1),
          );
        },
        isDeleting ? typingSpeed / 2 : typingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, words, typingSpeed, pauseDuration]);

  return displayed;
}

export default function PortfolioHero({ content }) {
  const typedRole = useTypingEffect(content.roles, 80, 2200);

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
        pt: { xs: 12, md: 14 },
        overflow: 'hidden',
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
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" spacing={4}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'primary.main' }}
          >
            {content.overline}
          </Typography>

          <Typography
            variant="h1"
            component="h1"
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {content.headline}
          </Typography>

          <Box
            sx={{
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="p"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                minWidth: 280,
              }}
            >
              {typedRole}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 2,
                  height: '1.1em',
                  backgroundColor: 'primary.main',
                  ml: 0.5,
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                  },
                }}
              />
            </Typography>
          </Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.125rem' }}
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
              href="#work"
            >
              {content.secondaryCta}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
