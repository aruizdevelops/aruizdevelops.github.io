'use client';

import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SpeedIcon from '@mui/icons-material/Speed';

const DEFAULT_ICON_MAP = {
  Verified: VerifiedIcon,
  RocketLaunch: RocketLaunchIcon,
  Handshake: HandshakeIcon,
  Speed: SpeedIcon,
};

export default function Benefits({ content, iconMap }) {
  const icons = { ...DEFAULT_ICON_MAP, ...iconMap };

  return (
    <Box component="section" id="benefits" sx={{ py: { xs: 10, md: 14 } }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'primary.main', mb: 2 }}
          >
            {content.overline}
          </Typography>
          <Typography variant="h2" component="h2">
            {content.headline}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {content.items.map((benefit) => {
            const IconComponent = icons[benefit.icon];
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={benefit.title}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.secondary.main}26 0%, ${theme.palette.secondary.dark}14 100%)`,
                        mx: 'auto',
                        mb: 2.5,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent
                          sx={{ color: 'secondary.main', fontSize: 28 }}
                        />
                      )}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
