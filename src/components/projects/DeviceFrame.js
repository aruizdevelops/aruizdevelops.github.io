'use client';

import { Box } from '@mui/material';

/**
 * CSS-only device mockup frame.
 * variant: 'browser' (default) or 'phone'
 */
export default function DeviceFrame({ variant = 'browser', children, sx }) {
  if (variant === 'phone') {
    return (
      <Box
        sx={{
          borderRadius: '24px',
          border: '3px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          maxWidth: 280,
          mx: 'auto',
          backgroundColor: 'background.paper',
          ...sx,
        }}
      >
        {/* Notch */}
        <Box
          sx={{
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 6,
              borderRadius: 3,
              bgcolor: 'divider',
            }}
          />
        </Box>
        {/* Screen */}
        <Box sx={{ lineHeight: 0 }}>{children}</Box>
        {/* Home indicator */}
        <Box
          sx={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
            }}
          />
        </Box>
      </Box>
    );
  }

  // Browser frame
  return (
    <Box
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        ...sx,
      }}
    >
      {/* Title bar */}
      <Box
        sx={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          gap: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F57' }} />
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28C840' }} />
        <Box
          sx={{
            flex: 1,
            mx: 2,
            height: 22,
            borderRadius: '6px',
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>
      {/* Content */}
      <Box sx={{ lineHeight: 0 }}>{children}</Box>
    </Box>
  );
}
