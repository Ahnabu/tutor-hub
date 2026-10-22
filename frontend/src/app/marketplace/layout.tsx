import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tuition Board & Verified Tuition Requirements',
  description:
    'Browse active, verified tuition requirements posted directly by guardians in Dhaka and across Bangladesh. Connect directly with zero agency commission.',
  keywords: [
    'Tuition board Dhaka',
    'Tuition requirements Bangladesh',
    'Private tuition jobs',
    'Tuition in Dhanmondi',
    'Tuition in Uttara',
    'Tuition in Mirpur',
    'BUET tutor tuition',
    'English medium tuition Dhaka',
  ],
  alternates: {
    canonical: '/marketplace',
  },
  openGraph: {
    title: 'Tuition Board & Verified Tuition Requirements | TutorHub',
    description:
      'Browse verified tuition job postings across Dhaka. Direct guardian connections with zero intermediary fees.',
    url: '/marketplace',
    type: 'website',
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
