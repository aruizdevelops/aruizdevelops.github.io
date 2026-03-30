'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Navigation({ content }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 50 });

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: scrolled
            ? 'rgba(11, 11, 18, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(245, 245, 247, 0.06)'
            : '1px solid transparent',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ height: 72 }}>
            <Typography
              variant="h6"
              component="a"
              href="/"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'text.primary',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 6 },
              }}
            >
              {content.brand}
            </Typography>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              {content.links.map((link) => (
                <Button
                  key={link.label}
                  href={link.href}
                  onClick={handleNavClick}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    px: 2,
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Button
              variant="contained"
              color="primary"
              href={content.ctaHref || '/#contact'}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {content.ctaLabel}
            </Button>

            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleDrawerToggle}
            aria-label="close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {content.links.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                component="a"
                href={link.href}
                onClick={handleNavClick}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              href={content.ctaHref || '/#contact'}
              onClick={handleNavClick}
            >
              {content.ctaLabel}
            </Button>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
