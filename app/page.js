'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { TenantProvider } from '../src/providers/TenantProvider';
import { CoreThemeProvider } from '../src/providers/CoreThemeProvider';
import { PageContainer } from '../src/components/common/PageContainer';
import { StatusChip } from '../src/components/common/StatusChip';
import { Logo } from '../src/components/common/Logo';
import { CORE_VERSION } from '../src/constants';

const componentGroups = [
  {
    category: 'Layout',
    items: [
      { name: 'AppShell', status: 'active', description: 'Admin layout with sidebar + topbar' },
      { name: 'LandingShell', status: 'active', description: 'Public-facing layout wrapper' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { name: 'TopBar', status: 'active', description: 'App bar with menu toggle and actions' },
      { name: 'Sidebar', status: 'active', description: 'Responsive drawer navigation' },
    ],
  },
  {
    category: 'Common',
    items: [
      { name: 'Logo', status: 'active', description: 'Tenant-aware logo (image or text fallback)' },
      { name: 'PageContainer', status: 'active', description: 'Page wrapper with title and subtitle' },
      { name: 'StatusChip', status: 'active', description: 'Color-coded status indicator' },
    ],
  },
  {
    category: 'Providers',
    items: [
      { name: 'TenantProvider', status: 'active', description: 'Tenant config context' },
      { name: 'CoreThemeProvider', status: 'active', description: 'MUI theme from tenant config' },
    ],
  },
  {
    category: 'Hooks',
    items: [
      { name: 'useLocalStorage', status: 'active', description: 'Persistent state in localStorage' },
      { name: 'useStepperFlow', status: 'active', description: 'Step state management hook' },
    ],
  },
  {
    category: 'Landing',
    items: [
      { name: 'Navigation', status: 'active', description: 'Responsive landing page navigation bar' },
      { name: 'Hero', status: 'active', description: 'Hero section with headline and CTA' },
      { name: 'Services', status: 'active', description: 'Services showcase grid' },
      { name: 'About', status: 'active', description: 'About section with business info' },
      { name: 'Benefits', status: 'active', description: 'Benefits highlight section' },
      { name: 'Process', status: 'active', description: 'Step-by-step process section' },
      { name: 'Testimonials', status: 'active', description: 'Customer testimonials carousel' },
      { name: 'CtaBanner', status: 'active', description: 'Call-to-action banner section' },
      { name: 'Footer', status: 'active', description: 'Landing page footer with links' },
      { name: 'LandingPage', status: 'active', description: 'Full landing page composition' },
    ],
  },
  {
    category: 'Forms',
    items: [
      { name: 'StepperFlow', status: 'active', description: 'Multi-step workflow shell' },
      { name: 'FormField', status: 'active', description: 'Labeled input wrapper' },
      { name: 'FormSection', status: 'active', description: 'Fieldset grouping' },
    ],
  },
];

export default function Home() {
  return (
    <TenantProvider>
      <CoreThemeProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Logo size="large" />
            <Typography variant="body1" color="text.secondary">
              Core Dev Playground &mdash; v{CORE_VERSION}
            </Typography>
          </Stack>

          <Stack spacing={3}>
            {componentGroups.map((group) => (
              <Card key={group.category}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {group.category}
                  </Typography>
                  <Stack spacing={1.5} divider={<Divider />}>
                    {group.items.map((item) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          {item.status === 'active' ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <ScheduleIcon color="warning" fontSize="small" />
                          )}
                          <Box>
                            <Typography variant="subtitle2">{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Box>
                        </Stack>
                        <StatusChip
                          status={item.status}
                          label={item.status === 'active' ? 'Ready' : 'Planned'}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4 }}>
            This playground is for developing and previewing core components.
            It is not part of the published package.
          </Typography>
        </Box>
      </CoreThemeProvider>
    </TenantProvider>
  );
}
