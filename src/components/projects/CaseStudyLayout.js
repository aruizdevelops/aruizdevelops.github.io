'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import TechStackChips from './TechStackChips';
import ProjectGallery from './ProjectGallery';

export default function CaseStudyLayout({ project, t }) {
  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 8, md: 12 } }}>
      {/* Hero banner */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          mb: { xs: 6, md: 10 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, ${project.accentColor}15 0%, transparent 60%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Button
            component={Link}
            href="/#work"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'text.secondary', textTransform: 'none', mb: 4 }}
          >
            {t('caseStudy.backToProjects')}
          </Button>

          <Typography
            variant="overline"
            component="p"
            sx={{ color: project.accentColor, mb: 2 }}
          >
            {t(project.appTypeKey)}
          </Typography>

          <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
            {t(project.nameKey)}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 640, fontSize: '1.125rem' }}
          >
            {t(project.summaryKey)}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <TechStackChips stack={project.techStack} accentColor={project.accentColor} />
          </Box>

          {project.demoUrl && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  bgcolor: project.accentColor,
                  '&:hover': {
                    bgcolor: project.accentColor,
                    filter: 'brightness(0.9)',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                }}
              >
                {t('caseStudy.launchApp')}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <Container>
        {/* Overview */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
            {t('caseStudy.overview')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, lineHeight: 1.8 }}>
            {t(project.overviewKey)}
          </Typography>
        </Box>

        {/* Challenge / Solution */}
        <Grid container spacing={6} sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}
            >
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                {t('caseStudy.challenge')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {t(project.challengeKey)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                border: '1px solid',
                borderColor: `${project.accentColor}30`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${project.accentColor}06 0%, transparent 100%)`,
              }}
            >
              <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
                {t('caseStudy.solution')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {t(project.solutionKey)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Key Features */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
            {t('caseStudy.features')}
          </Typography>
          <List disablePadding>
            {project.featureKeys.map((key) => (
              <ListItem key={key} disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleOutlineIcon sx={{ color: project.accentColor, fontSize: 24 }} />
                </ListItemIcon>
                <ListItemText
                  primary={t(key)}
                  primaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Visual Preview Gallery */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
            {t('caseStudy.gallery')}
          </Typography>
          <ProjectGallery
            images={project.images.gallery}
            projectName={t(project.nameKey)}
            accentColor={project.accentColor}
          />
        </Box>

        {/* Design Highlights */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
            {t('caseStudy.design')}
          </Typography>
          <Stack spacing={3}>
            {project.designHighlightKeys.map((key) => (
              <Stack key={key} direction="row" spacing={2} alignItems="flex-start">
                <AutoAwesomeIcon sx={{ color: project.accentColor, mt: 0.5, flexShrink: 0 }} />
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {t(key)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Mobile Experience */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <SmartphoneIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h3" component="h2">
              {t('caseStudy.mobile')}
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, lineHeight: 1.8 }}>
            {t(project.mobileNotesKey)}
          </Typography>
        </Box>

        {/* Future Enhancements */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
            {t('caseStudy.future')}
          </Typography>
          <List disablePadding>
            {project.futureKeys.map((key) => (
              <ListItem key={key} disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ArrowForwardIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={t(key)}
                  primaryTypographyProps={{ variant: 'body1', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: { xs: 6, md: 8 } }} />

        {/* Contact CTA */}
        <Box
          sx={{
            py: 8,
            px: 4,
            textAlign: 'center',
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${project.accentColor}08 0%, ${theme.palette.primary.main}0A 100%)`,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
            {t('caseStudy.ctaHeadline')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
          >
            {t('caseStudy.ctaSubtitle')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href={`mailto:${t('contact.email')}`}
            endIcon={<ArrowForwardIcon />}
          >
            {t('caseStudy.ctaButton')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
