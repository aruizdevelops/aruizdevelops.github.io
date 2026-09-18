import ApproveClient from './ApproveClient';

export const metadata = {
  title: 'Daily Approvals | Texas Craft Sites',
  description:
    'Review Texas Craft Sites scout batches. Email tab: Accept or Skip. Call tab is a phone-only review list.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApprovePage() {
  return <ApproveClient />;
}
