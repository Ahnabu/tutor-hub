import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Verified Private Tutors in Dhaka & Bangladesh',
  description:
    'Search background-verified private tutors from BUET, Dhaka University, medical colleges, and top institutions. Filter by subject, curriculum, and neighborhood across Dhaka.',
  keywords: [
    'Find tutor Dhaka',
    'Verified tutor Bangladesh',
    'BUET home tutor',
    'DU private tutor',
    'Physics tutor Dhaka',
    'Higher Math tutor Dhaka',
    'English medium tutor Bangladesh',
    'Home tutor Dhanmondi',
    'Home tutor Uttara',
    'Home tutor Mirpur',
  ],
  alternates: {
    canonical: '/teachers',
  },
  openGraph: {
    title: 'Find Verified Private Tutors in Dhaka | TutorHub',
    description:
      'Search background-verified university mentors. Zero intermediary commission, direct contact requests.',
    url: '/teachers',
    type: 'website',
  },
};

export default function TeachersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
