'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { useTenant } from '../../providers/TenantProvider';

export function Logo({ size = 'medium', ...props }) {
  const tenant = useTenant();
  const theme = useTheme();

  const sizes = {
    small: { fontSize: '1rem', height: 28 },
    medium: { fontSize: '1.25rem', height: 36 },
    large: { fontSize: '1.75rem', height: 48 },
  };

  const { fontSize, height } = sizes[size] || sizes.medium;

  if (tenant.logo) {
    return (
      <Box
        component="img"
        src={tenant.logo}
        alt={`${tenant.name} logo`}
        sx={{ height, objectFit: 'contain', ...props.sx }}
        {...props}
      />
    );
  }

  const gradientStart = theme.palette.primary.dark || theme.palette.primary.main;
  const gradientEnd = theme.palette.primary.light || theme.palette.primary.main;

  return (
    <Typography
      variant="h6"
      sx={{
        fontSize,
        fontWeight: 800,
        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        ...props.sx,
      }}
      {...props}
    >
      {tenant.name}
    </Typography>
  );
}

export default Logo;
