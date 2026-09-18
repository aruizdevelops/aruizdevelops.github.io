import { Suspense } from 'react';
import UnsubscribeClient from './UnsubscribeClient';

export const metadata = {
  title: 'Unsubscribe | Texas Craft Sites',
  description:
    'Opt out of Texas Craft Sites outreach email. Confirm once to be removed from the list.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeClient />
    </Suspense>
  );
}
