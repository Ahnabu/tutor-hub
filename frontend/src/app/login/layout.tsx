import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In — TutorHub',
  description: 'Log in to your TutorHub guardian or teacher portal.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
