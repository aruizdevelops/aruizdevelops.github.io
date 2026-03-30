'use client';

import { Box, Typography } from '@mui/material';

export function FormSection({ title, description, children, ...props }) {
  return (
    <Box sx={{ mb: 3 }} {...props}>
      {title && (
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}

export default FormSection;
