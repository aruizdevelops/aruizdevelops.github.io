'use client';

import { Box } from '@mui/material';
import { useTenant } from '../../providers/TenantProvider';
import Navigation from '../landing/Navigation';
import Footer from '../landing/Footer';

export function LandingShell({ children, navContent, footerContent, socialIcons }) {
  const tenant = useTenant();

  // Use provided content or fall back to tenant content if available
  const navProps = navContent || tenant.content?.NAVIGATION || {};
  const footerProps = footerContent || tenant.content?.FOOTER || {};

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation content={navProps} />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer content={footerProps} socialIcons={socialIcons} />
    </Box>
  );
}

export default LandingShell;
