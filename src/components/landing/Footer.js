'use client';

import { Box, Container, Typography, Grid, Stack, Link, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';

const DEFAULT_SOCIAL_ICONS = [
  { label: 'LinkedIn', icon: LinkedInIcon },
  { label: 'X (Twitter)', icon: XIcon },
  { label: 'GitHub', icon: GitHubIcon },
];

export default function Footer({ content, socialIcons }) {
  const socials = socialIcons || DEFAULT_SOCIAL_ICONS;

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 8 },
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="h6"
              component="p"
              sx={{ fontWeight: 700, mb: 1.5 }}
            >
              {content.brand}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 280 }}
            >
              {content.tagline}
            </Typography>
            <Stack direction="row" spacing={1}>
              {socials.map((social) => {
                const SocialIcon = social.icon;
                return (
                  <IconButton
                    key={social.label}
                    size="small"
                    aria-label={social.label}
                    {...(social.href ? { component: 'a', href: social.href } : {})}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                  >
                    <SocialIcon fontSize="small" />
                  </IconButton>
                );
              })}
            </Stack>
          </Grid>

          {content.columns.map((column) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={column.title}>
              <Typography
                variant="overline"
                component="p"
                sx={{
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '0.75rem',
                }}
              >
                {column.title}
              </Typography>
              <Stack spacing={1.5}>
                {column.links.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      underline="none"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        transition: 'color 200ms',
                        '&:hover': { color: 'text.primary' },
                      }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Typography
                      key={link.label}
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {link.label}
                    </Typography>
                  ),
                )}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 8,
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {content.copyright}
          </Typography>
          <Stack direction="row" spacing={3}>
            {content.legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                underline="none"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
