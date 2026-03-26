'use client';

import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

export default function ProjectCard({ project, t }) {
  return (
    <Card
      component={Link}
      href={`/projects/${project.slug}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 16px 48px ${project.accentColor}20`,
          borderColor: `${project.accentColor}40`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${project.accentColor}, ${project.secondaryColor || project.accentColor})`,
          opacity: 0,
          transition: 'opacity 300ms ease',
        },
        '&:hover::after': {
          opacity: 1,
        },
      }}
    >
      {/* Thumbnail placeholder */}
      <Box
        sx={{
          height: 200,
          background: `linear-gradient(135deg, ${project.accentColor}15 0%, ${project.secondaryColor || project.accentColor}10 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={project.images.thumbnail}
          alt={t(project.nameKey)}
          sx={{
            maxWidth: '80%',
            maxHeight: '80%',
            objectFit: 'contain',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Chip
            label={t(project.appTypeKey)}
            size="small"
            sx={{
              bgcolor: `${project.accentColor}18`,
              color: project.accentColor,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        <Typography variant="h5" component="h3" sx={{ mb: 1.5 }}>
          {t(project.nameKey)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {t(project.summaryKey)}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {project.techStack.slice(0, 4).map((tech) => (
            <Chip
              key={tech}
              label={tech}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 24,
                borderColor: 'divider',
                color: 'text.secondary',
              }}
            />
          ))}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: project.accentColor,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {t('work.viewCaseStudy')}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </CardActions>
    </Card>
  );
}
