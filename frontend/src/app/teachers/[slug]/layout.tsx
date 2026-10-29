import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rawBackendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
    'https://backend-five-rosy-71.vercel.app';
  const backendUrl = rawBackendUrl.replace(/\/$/, '');

  try {
    const res = await fetch(`${backendUrl}/api/v1/teachers/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      const teacher = data.data?.teacher;
      if (teacher) {
        const title = `${teacher.name} — Verified Tutor (${teacher.institution || 'Top University'})`;
        const description = teacher.bio
          ? `${teacher.bio.slice(0, 140)}... Hire ${teacher.name} for ${teacher.subjectsOffered?.slice(0, 4).join(', ') || 'private tuition'}.`
          : `Hire verified tutor ${teacher.name} studying at ${teacher.institution || 'university'} offering ${teacher.subjectsOffered?.slice(0, 4).join(', ') || 'academic lessons'}.`;

        return {
          title,
          description,
          alternates: {
            canonical: `/teachers/${slug}`,
          },
          openGraph: {
            title: `${title} | TutorHub`,
            description,
            url: `/teachers/${slug}`,
            images: teacher.avatarUrl ? [{ url: teacher.avatarUrl }] : ['/icon.svg'],
          },
        };
      }
    }
  } catch {
    // Fallback if backend fetch is not reachable during build
  }

  const formattedName = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  return {
    title: `${formattedName} — Verified Tutor Profile`,
    description: `View academic credentials, offered subjects, and contact information for verified tutor on TutorHub.`,
    alternates: {
      canonical: `/teachers/${slug}`,
    },
  };
}

export default function TeacherProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
