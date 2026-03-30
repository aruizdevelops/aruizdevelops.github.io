'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DevicesIcon from '@mui/icons-material/Devices';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';

const DEFAULT_ICON_MAP = {
  Insights: InsightsIcon,
  Devices: DevicesIcon,
  Brush: BrushIcon,
  Code: CodeIcon,
  TrendingUp: TrendingUpIcon,
  BarChart: BarChartIcon,
};

export default function Services({ content, iconMap }) {
  const icons = { ...DEFAULT_ICON_MAP, ...iconMap };

  return (
    <Box
      component="section"
      id="services"
      sx={{ py: { xs: 10, md: 14 } }}
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

        <Grid container spacing={4}>
          {content.items.map((service) => {
            const IconComponent = icons[service.icon];
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.title}>
                <Card
                  sx={{
                    height: '100%',
                    p: 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                      borderColor: (theme) =>
                        `${theme.palette.primary.main}26`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.primary.main}26 0%, ${theme.palette.primary.light}14 100%)`,
                        mb: 2.5,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent sx={{ color: 'primary.main', fontSize: 24 }} />
                      )}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
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
