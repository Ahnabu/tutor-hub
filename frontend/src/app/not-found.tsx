import Link from 'next/link';
import { GraduationCap, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#090D16] text-white text-center">
      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
        <GraduationCap className="h-7 w-7 text-emerald-400" />
      </div>
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">404 — Page Not Found</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The link may have expired or moved. Head back home or browse verified tutors and tuition posts.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-medium text-sm transition-colors"
        >
          <Compass className="h-4 w-4 text-emerald-400" />
          Find Tutors
        </Link>
      </div>
    </div>
  );
}
