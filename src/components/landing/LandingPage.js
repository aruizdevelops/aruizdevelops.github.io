'use client';

import { Box } from '@mui/material';
import Navigation from './Navigation';
import Hero from './Hero';
import Services from './Services';
import About from './About';
import Benefits from './Benefits';
import Process from './Process';
import Testimonials from './Testimonials';
import CtaBanner from './CtaBanner';
import Footer from './Footer';

export default function LandingPage({ content, iconMaps, socialIcons }) {
  return (
    <>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 16,
            left: 16,
            width: 'auto',
            height: 'auto',
            zIndex: 9999,
            bgcolor: 'background.paper',
            color: 'text.primary',
            p: 2,
            borderRadius: 1,
            boxShadow: 4,
          },
        }}
      >
        Skip to main content
      </Box>
      <Navigation content={content.NAVIGATION} />
      <main id="main-content">
        <Hero content={content.HERO} />
        <Services content={content.SERVICES} iconMap={iconMaps?.services} />
        <About content={content.ABOUT} />
        <Benefits content={content.BENEFITS} iconMap={iconMaps?.benefits} />
        <Process content={content.PROCESS} />
        <Testimonials content={content.TESTIMONIALS} />
        <CtaBanner content={content.CTA} />
      </main>
      <Footer content={content.FOOTER} socialIcons={socialIcons} />
    </>
  );
}
