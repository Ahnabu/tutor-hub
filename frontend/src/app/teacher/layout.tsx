import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Operations Dashboard — TutorHub',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
