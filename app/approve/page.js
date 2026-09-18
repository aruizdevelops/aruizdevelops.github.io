import ApproveClient from './ApproveClient';

export const metadata = {
  title: 'Daily Approvals | Texas Craft Sites',
  description:
    'Review Texas Craft Sites scout batches. Tap Accept or Skip as you check each shop.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApprovePage() {
  return <ApproveClient />;
}
