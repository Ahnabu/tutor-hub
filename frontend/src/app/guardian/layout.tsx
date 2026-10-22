import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guardian Dashboard — TutorHub',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuardianDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
