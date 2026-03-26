'use client';

import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import DeviceFrame from './DeviceFrame';

function GalleryImage({ src, projectName, index, accentColor, isPhone }) {
  const [hasError, setHasError] = useState(false);

  return (
    <DeviceFrame variant={isPhone ? 'phone' : 'browser'}>
      <Box
        sx={{
          width: '100%',
          aspectRatio: isPhone ? '9/16' : '16/10',
          background: `linear-gradient(135deg, ${accentColor}12 0%, ${accentColor}06 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasError ? (
          <Typography
            variant="caption"
            sx={{ opacity: 0.3, color: 'text.secondary' }}
          >
            Preview
          </Typography>
        ) : (
          <Box
            component="img"
            src={src}
            alt={`${projectName}, preview ${index + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setHasError(true)}
          />
        )}
      </Box>
    </DeviceFrame>
  );
}

export default function ProjectGallery({ images, projectName, accentColor }) {
  if (!images || images.length === 0) return null;

  return (
    <Box>
      <Grid container spacing={3}>
        {images.map((src, index) => {
          const isPhone = src.includes('mobile');
          return (
            <Grid
              size={{ xs: 12, sm: isPhone ? 4 : 6 }}
              key={src}
            >
              <GalleryImage
                src={src}
                projectName={projectName}
                index={index}
                accentColor={accentColor}
                isPhone={isPhone}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
