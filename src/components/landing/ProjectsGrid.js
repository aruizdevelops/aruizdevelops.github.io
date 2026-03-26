'use client';

import { Box, Container, Typography, Grid, Stack } from '@mui/material';
import ProjectCard from './ProjectCard';
import { PROJECTS } from '../../constants/projects';

export default function ProjectsGrid({ content, t }) {
  return (
    <Box
      component="section"
      id="work"
      sx={{ py: { xs: 12, md: 18 } }}
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
          {PROJECTS.map((project) => (
            <Grid size={{ xs: 12, md: 6 }} key={project.id}>
              <ProjectCard project={project} t={t} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
