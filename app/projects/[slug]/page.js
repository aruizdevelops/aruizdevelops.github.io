import { getAllProjectSlugs } from '../../../src/constants/projects';
import CaseStudyClient from './CaseStudyClient';

export function generateStaticParams() {
  return getAllProjectSlugs();
}

export default function CaseStudyPage() {
  return <CaseStudyClient />;
}
