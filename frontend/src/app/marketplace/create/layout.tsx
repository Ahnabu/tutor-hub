import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Tuition Requirement — Guardian Portal',
  description:
    'Post your student’s tuition needs to receive direct applications from verified university mentors from BUET, DU, DMC, and top institutions across Bangladesh.',
  alternates: {
    canonical: '/marketplace/create',
  },
  openGraph: {
    title: 'Post Tuition Requirement | TutorHub Guardian Portal',
    description:
      'Find the best verified tutor for your child with zero agency fees.',
    url: '/marketplace/create',
  },
};

export default function CreateTuitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
