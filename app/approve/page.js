import ApproveClient from './ApproveClient';

export const metadata = {
  title: 'Daily Approvals | Texas Craft Sites',
  description:
    'Review Texas Craft Sites scout batches. Email: Accept or Skip. Call: Interested, Callback, No answer, Bad number, Remove.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApprovePage() {
  return <ApproveClient />;
}
