import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Free Account — TutorHub',
  description: 'Sign up for TutorHub to manage tuitions or find verified university tutors in Bangladesh.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
