/**
 * Tenant configuration for Bluebonnet Tech Portfolio.
 * Dark "Midnight Indigo" theme — premium, tech-forward, steel blue + mint.
 */
const tenantConfig = {
  id: 'portfolio',
  name: 'Bluebonnet Tech',
  logo: null,
  theme: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#4A8FE7',
        light: '#6BA8F5',
        dark: '#3570B8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#5EEBC0',
        light: '#8CF2D6',
        dark: '#3BBF96',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#08090E',
        paper: '#10111A',
      },
      text: {
        primary: '#F0F2F5',
        secondary: '#B0B5C5',
      },
      error: {
        main: '#FF4C6A',
      },
      warning: {
        main: '#FFB84D',
      },
      success: {
        main: '#5EEBC0',
      },
      info: {
        main: '#4A8FE7',
      },
      divider: 'rgba(255, 255, 255, 0.06)',
    },
    typography: {
      h1: {
        fontSize: 'clamp(2.5rem, 1.5rem + 4vw, 4.5rem)',
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontSize: 'clamp(1.75rem, 1.15rem + 2.5vw, 3rem)',
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 2rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.25,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1.0625rem',
        lineHeight: 1.75,
      },
      body2: {
        fontSize: '0.9375rem',
        lineHeight: 1.7,
      },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.12em',
        fontSize: '0.75rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 28px',
            fontWeight: 600,
            textTransform: 'none',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4A8FE7 0%, #6BA8F5 100%)',
            boxShadow: '0 4px 20px rgba(74, 143, 231, 0.30)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3570B8 0%, #4A8FE7 100%)',
              boxShadow: '0 6px 28px rgba(74, 143, 231, 0.40)',
            },
          },
          outlinedPrimary: {
            borderColor: 'rgba(74, 143, 231, 0.4)',
            color: '#4A8FE7',
            '&:hover': {
              borderColor: '#4A8FE7',
              backgroundColor: 'rgba(74, 143, 231, 0.06)',
            },
          },
          sizeLarge: {
            padding: '14px 36px',
            fontSize: '1rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(16, 17, 26, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            transition:
              'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
    },
  },
  features: {
    portfolio: true,
    caseStudies: true,
    contact: true,
  },
};

export default tenantConfig;
