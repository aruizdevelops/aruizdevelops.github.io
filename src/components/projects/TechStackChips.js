'use client';

import { Stack, Chip } from '@mui/material';

export default function TechStackChips({ stack, accentColor }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {stack.map((tech) => (
        <Chip
          key={tech}
          label={tech}
          size="small"
          sx={{
            bgcolor: accentColor ? `${accentColor}15` : 'rgba(74, 143, 231, 0.1)',
            color: accentColor || 'primary.main',
            fontWeight: 600,
            fontSize: '0.8rem',
            border: '1px solid',
            borderColor: accentColor ? `${accentColor}30` : 'rgba(74, 143, 231, 0.2)',
          }}
        />
      ))}
    </Stack>
  );
}
