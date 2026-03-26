'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function Testimonials({ content }) {
  return (
    <Box
      component="section"
      id="testimonials"
      sx={{ py: { xs: 10, md: 14 } }}
    >
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
          {content.items.map((testimonial) => (
            <Grid size={{ xs: 12, md: 4 }} key={testimonial.name}>
              <Card
                sx={{
                  height: '100%',
                  p: 1,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <FormatQuoteIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 32,
                      opacity: 0.6,
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="body1"
                    component="blockquote"
                    color="text.secondary"
                    sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.8, m: 0, mb: 3 }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.dark',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                      aria-hidden="true"
                    >
                      {testimonial.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="p"
                      >
                        {testimonial.role}, {testimonial.company}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
