import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Calendar,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#090D16]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Tutor<span className="text-emerald-400">Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Bangladesh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.08] text-xs font-medium text-slate-300 mb-8 backdrop-blur-md shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Next-Day Memory Logging • Guardian Privacy Portal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          The Intelligent Operating System for{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Private Tutors
          </span>{' '}
          in Bangladesh
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Effortlessly track multi-student, multi-subject tuition sessions with cycle day counting,
          homework checks, and automated zero-friction progress links for parents.
        </p>

        {/* CTA Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all"
          >
            Start Free as a Tutor <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/guardian/claim"
            className="h-12 px-8 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/[0.1] text-slate-200 font-semibold text-base flex items-center justify-center gap-2 backdrop-blur-xl transition-all"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Guardian Portal
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cycle Tracking & Day Counters</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Auto-calculate 12 or 16-day monthly cycles. Easily account for regular, extra, and
              makeup classes without payment disputes with guardians.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Next-Day Memory Prefill</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Never forget where you left off. Daily sessions automatically pre-fill unfinished
              topics, homework assigned last session, and today&apos;s lesson plan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Privacy-First Guardian Link</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Share encrypted PIN-protected progress links. Guardians see real-time attendance and
              remarks with zero sign-up friction, with absolute PII protection.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-slate-500">
        <p>© 2026 TutorHub Bangladesh. Built for tutors and guardians across Bangladesh.</p>
      </footer>
    </div>
  );
}
