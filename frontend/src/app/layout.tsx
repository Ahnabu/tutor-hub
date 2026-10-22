import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tutorhub.com.bd';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'TutorHub — Operations & Memory Platform for Private Tutors',
    template: '%s | TutorHub Bangladesh',
  },
  description:
    'High-performance operations SaaS and verified tutor network in Bangladesh. Cycle attendance tracking, verified credentials, zero commission, and transparent guardian portals.',
  keywords: [
    'Tutor in Bangladesh',
    'Tutor in Dhaka',
    'Private Tutor Dhaka',
    'Home Tutor Dhanmondi',
    'Home Tutor Mirpur',
    'Home Tutor Uttara',
    'BUET Tutor',
    'DU Tutor',
    'DMC Tutor',
    'English Medium Tutor',
    'Bangla Medium Tutor',
    'Tuition Management App',
    'Tuition tracker',
    'Tuition salary tracker',
    'Guardian portal',
    'Tutor marketplace',
    'Tuition matching Bangladesh',
  ],
  authors: [{ name: 'TutorHub Team', url: baseUrl }],
  creator: 'TutorHub',
  publisher: 'TutorHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TutorHub — Operations & Memory Platform for Private Tutors',
    description:
      'Verified university tutors from BUET, DU, and medical colleges. Intelligent cycle day tracking, salary receipts, and zero agency fees.',
    url: baseUrl,
    siteName: 'TutorHub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'TutorHub Bangladesh',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'TutorHub — Operations & Memory Platform for Private Tutors',
    description:
      'Verified university tutors, transparent tuition tracking, zero commission in Bangladesh.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  category: 'education',
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${baseUrl}/#organization`,
      name: 'TutorHub',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
        caption: 'TutorHub Bangladesh',
      },
      description:
        'Operations & memory platform for private tutors, verified university mentors, and guardians across Bangladesh.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dhaka',
        addressCountry: 'BD',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Bangladesh',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'TutorHub',
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/marketplace?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400 transition-colors duration-200">
        <Providers>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
