'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import {
  GraduationCap,
  ShieldCheck,
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Compass,
  FileCheck,
  CreditCard,
  Users,
  ChevronRight,
  X,
  Play,
  HelpCircle,
  Eye,
  Check,
  Layers,
  Clock,
  Shield,
  Smartphone,
} from 'lucide-react';

export default function Home() {
  // State for interactive Guided Introduction Tour Modal
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourRole, setTourRole] = useState<'teacher' | 'guardian'>('teacher');
  const [tourStep, setTourStep] = useState(0);

  // State for Interactive "How it Works" section
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'teacher' | 'guardian'>('teacher');

  // State for Interactive FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if first-time visitor on mount
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('tutorhub_intro_tour_seen');
      if (!tourSeen) {
        // Automatically open guided tour on first entry
        setIsTourOpen(true);
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  const closeTour = () => {
    setIsTourOpen(false);
    try {
      localStorage.setItem('tutorhub_intro_tour_seen', 'true');
    } catch {
      // Ignore
    }
  };

  const openTourManual = (role: 'teacher' | 'guardian' = 'teacher') => {
    setTourRole(role);
    setTourStep(0);
    setIsTourOpen(true);
  };

  // Tour steps definition
  const teacherSteps = [
    {
      title: '1. Create Student Agreements & Cycles',
      description:
        'Set up each student with their class, subjects, monthly fee in BDT, and target cycle days (e.g. 12 or 16 classes). TutorHub eliminates calendar confusion and payment disputes.',
      badge: 'Step 1 of 3 • Cycle Management',
      icon: Calendar,
      highlight: 'Cycle counters track regular, extra, and makeup classes automatically.',
    },
    {
      title: '2. Next-Day Memory Session Logger',
      description:
        'Never forget what you taught. When logging a class, TutorHub automatically pre-fills unfinished topics from yesterday, verifies homework assignments, and preps today’s lesson.',
      badge: 'Step 2 of 3 • Cognitive Prefill',
      icon: BookOpen,
      highlight: 'Saves 10 minutes every class and impresses parents with continuity.',
    },
    {
      title: '3. Get Verified & Apply on Tuition Board',
      description:
        'Upload your National ID and University Student ID for administrative verification. Earn the Verified Tutor badge and apply directly to live guardian openings across Dhaka.',
      badge: 'Step 3 of 3 • Verified Growth',
      icon: ShieldCheck,
      highlight: 'Zero commission middleman cuts — direct contact unlock upon match.',
    },
  ];

  const guardianSteps = [
    {
      title: '1. Zero-Friction PIN Progress Viewer',
      description:
        'No complicated apps to install. Your tutor shares a secure link with a 4-digit PIN. Open it anytime to view your child’s live attendance, topics covered, and teacher remarks.',
      badge: 'Step 1 of 3 • Transparency',
      icon: Lock,
      highlight: 'Bank-grade privacy: tutor personal phone & notes are protected.',
    },
    {
      title: '2. Search Verified University Tutors',
      description:
        'Filter top university educators (DU, BUET, DMC, NSU, etc.) by your Dhaka neighborhood (Dhanmondi, Mirpur, Uttara, Gulshan) with verified background credentials.',
      badge: 'Step 2 of 3 • Verified Directory',
      icon: GraduationCap,
      highlight: 'Directly request contact access with requirement notes.',
    },
    {
      title: '3. Post on the Live Tuition Board',
      description:
        'Post your exact tuition requirements (grade, subjects, weekly days, and budget). Review qualified applicant pitches and click "Accept Tutor" to unlock mutual phone & WhatsApp contact.',
      badge: 'Step 3 of 3 • Live Marketplace',
      icon: ShoppingBag,
      highlight: '100% free for parents with direct tutor hiring.',
    },
  ];

  const currentSteps = tourRole === 'teacher' ? teacherSteps : guardianSteps;

  const faqs = [
    {
      q: 'What is TutorHub and who is it designed for?',
      a: 'TutorHub is Bangladesh’s specialized tuition operations, cognitive memory, and transparency platform. It connects dedicated university tutors and caring guardians. Tutors use it to log classes without forgetting topics, while guardians track student progress and hire verified teachers with complete peace of mind.',
    },
    {
      q: 'How does the "Next-Day Memory" engine work?',
      a: 'Tutors often juggle 5 to 10 different students and forget where they left off. TutorHub remembers the last unfinished topics, assigned homework, and upcoming curriculum, automatically pre-filling today’s session log as soon as the tutor opens the tuition desk.',
    },
    {
      q: 'Do parents need to create an account to view student progress?',
      a: 'No! Tutors can share a PIN-protected link (e.g. /guardian/view/[token]). Guardians simply enter a 4-digit PIN to immediately see real-time attendance, cycle day counters, topics taught, and payment history with zero sign-up friction.',
    },
    {
      q: 'How are tutors verified on TutorHub?',
      a: 'Tutors upload authentic copies of both their National ID / Birth Certificate and University Student ID card. Our administrative compliance team inspects each document manually before issuing the coveted "Verified Tutor" badge.',
    },
    {
      q: 'How does the Tuition Board marketplace work?',
      a: 'Guardians post tuition openings with their student’s grade, subject needs, preferred neighborhood, and monthly budget. Verified tutors submit detailed application pitches. Once the guardian accepts an applicant, mutual contact information (phone & WhatsApp) is securely unlocked.',
    },
    {
      q: 'Is TutorHub free to use?',
      a: 'Yes! Tutors can manage tuitions, use Next-Day Memory logs, and apply to openings for free. Guardians can browse tutors, view PIN links, and post tuition requirements completely free with zero middleman fees.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400 pb-20 sm:pb-0 overflow-x-hidden">
      {/* Background Ambience Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Shared Header Navigation */}
      <Navbar />

      <main className="flex-1 relative z-10 w-full">
        {/* ==================================================================== */}
        {/* SECTION 1: HERO & GUIDED LEARNING ENTRY */}
        {/* ==================================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 flex flex-col items-center text-center">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/[0.08] text-xs font-medium text-slate-300 mb-6 backdrop-blur-md shadow-sm max-w-[92vw]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-400 font-semibold shrink-0">TutorHub</span>
            <span className="text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300">Next-Day Memory • Cycle Tracking • Verified Tutors</span>
            <span className="sm:hidden text-[11px] text-slate-300 truncate">Next-Day Memory & Cycle OS</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            Where Dedicated Tutors & Caring Guardians Connect with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Total Clarity.
            </span>
          </h1>

          {/* Subtitle / Platform Description */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
            The intelligent operations and transparency ecosystem for private education in Bangladesh.
            Automate daily session memory, eliminate cycle billing disputes, verify university credentials,
            and hire top tutors without middleman commissions.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.99] whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Get Started Free</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            <button
              type="button"
              onClick={() => openTourManual('teacher')}
              className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 border border-white/[0.1] backdrop-blur-xl transition-all cursor-pointer shadow-lg active:scale-[0.99] whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Take Guided Tour (60s)</span>
            </button>

            <Link
              href="/marketplace"
              className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/[0.08] transition-all whitespace-nowrap"
            >
              <ShoppingBag className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="whitespace-nowrap">Live Tuition Board</span>
            </Link>
          </div>

          {/* Platform Trust & KPI Chips */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] backdrop-blur-md text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 block">100%</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Vetted Documents (NID + Uni)</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] backdrop-blur-md text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono text-teal-400 block">Zero</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Forgotten Topics / Lessons</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] backdrop-blur-md text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 block">4-Digit</span>
              <span className="text-[11px] sm:text-xs text-slate-400">PIN Parent Transparency</span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] backdrop-blur-md text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 block">0%</span>
              <span className="text-[11px] sm:text-xs text-slate-400">Middleman Agency Cuts</span>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: WHAT TUTORHUB DOES (Problem vs Solution) */}
        {/* ==================================================================== */}
        <section className="py-16 bg-slate-950/60 border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Core Purpose & Philosophy
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Solving the Hard Realities of Private Tuition in Bangladesh
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Private tutoring has long suffered from paper diaries, forgotten homework, payment misunderstandings,
                unvetted profiles, and high middleman agency cuts. TutorHub solves each systematically:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem 1 & Solution */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>The Old Problem: Disputed Cycle Days</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    &quot;How many days did the tutor actually come this month?&quot;
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paper calendars lead to awkward end-of-month arguments over canceled, makeup, and extra classes.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>TutorHub Solution:</strong> Transactional cycle day counters (12 or 16-day cycles) with real-time logging, attendance receipts, and cycle rollover logs.
                  </span>
                </div>
              </div>

              {/* Problem 2 & Solution */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>The Old Problem: Cognitive Overload & Amnesia</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    &quot;Wait, where did we stop in Physics last Tuesday?&quot;
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tutors manage 5+ students across HSC, SSC, and O-Levels. Remembering homework assignments and lesson plans requires tedious guesswork.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                  <BookOpen className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>TutorHub Solution:</strong> Next-Day Memory Engine automatically retrieves unfinished chapters, pending homework, and lesson goals upon opening the log.
                  </span>
                </div>
              </div>

              {/* Problem 3 & Solution */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>The Old Problem: Unverified Credentials</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    &quot;Is this tutor really enrolled at BUET or Dhaka University?&quot;
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Social media groups and unverified posts are flooded with fake certificates, posing safety risks to families.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>TutorHub Solution:</strong> Dual-document upload verification (National ID / Birth Certificate + University ID) checked manually by compliance administrators.
                  </span>
                </div>
              </div>

              {/* Problem 4 & Solution */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>The Old Problem: Predatory Middleman Cuts</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    &quot;Agencies take 50% to 100% of the first month’s tuition fee.&quot;
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Traditional matchmakers exploit young university students and charge high upfront security fees without guarantees.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                  <ShoppingBag className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>TutorHub Solution:</strong> Open, transparent Live Tuition Board where parents post directly, tutors pitch directly, and mutual contact is unlocked with zero fee cuts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: HOW IT WORKS IN 4 STEPS (INTERACTIVE TABS) */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Interactive Walkthrough
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              How TutorHub Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Switch roles below to explore the exact 4-step workflow tailored for you:
            </p>

            {/* Role Switcher Pill */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-white/[0.08] mt-2">
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('teacher')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeWorkflowTab === 'teacher'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>For Private Tutors</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflowTab('guardian')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeWorkflowTab === 'guardian'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>For Parents & Guardians</span>
              </button>
            </div>
          </div>

          {/* 4-Step Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {activeWorkflowTab === 'teacher' ? (
              <>
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors block mb-2">
                    01
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Define Tuition Contract</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Add student name, grade, subjects, monthly fee in BDT, and target classes per cycle (e.g. 12 days).
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors block mb-2">
                    02
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Log with Next-Day Memory</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Open the session logger; yesterday’s unfinished topics and homework pre-populate with 1-tap confirmation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors block mb-2">
                    03
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Share Live Parent Link</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Send a PIN-protected link to parents via WhatsApp so they can check attendance progress with zero calls.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-emerald-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400/20 group-hover:text-emerald-400/40 transition-colors block mb-2">
                    04
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Get Verified & Grow</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload NID & Student ID, unlock the Verified Tutor badge, and apply for new high-paying tuition requests.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors block mb-2">
                    01
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Receive Tutor PIN Link</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your tutor sends a private link. No app download needed; simply enter your 4-digit numeric PIN.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors block mb-2">
                    02
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Inspect Real-Time Progress</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    See exact class dates, covered math/physics chapters, homework remarks, and cycle completion bars.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors block mb-2">
                    03
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Browse Verified Teachers</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Need another tutor? Filter by university (BUET, DU, etc.) and neighborhood (Mirpur, Uttara, etc.).
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl relative group hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl font-mono font-extrabold text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors block mb-2">
                    04
                  </span>
                  <h3 className="text-base font-bold text-white mb-1.5">Post Tuition Openings</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Post your child’s needs on the Live Board. Receive pitches from verified tutors and hire with 1 click.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: CORE PILLARS & FEATURES SHOWCASE */}
        {/* ==================================================================== */}
        <section className="py-16 bg-slate-950/40 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Engineered for Excellence
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Complete Feature Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Next-Day Memory Prefill</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminates mental fatigue. Each logged class automatically pulls in homework assigned previously, unfinished topics, and today’s curriculum goals.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">PIN-Protected Parent Viewer</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guardians access an encrypted view of attendance, remarks, and fees with a 4-digit PIN. Strictly protects tutor phone and email privacy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Dual-Sided Live Tuition Board</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Parents post openings with preferred neighborhood and budget. Verified tutors pitch directly. Accepting a tutor generates mutual contact grants instantly.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">2-Document Credential Vetting</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated upload fields for National ID / Birth Certificate and University Student ID (Max 3 MB each). Inspected and approved by platform administrators.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Cycle Accounting & Payment Ledger</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log payments across bKash, Nagad, Cash, or Bank Transfer. Auto-triggers cycle closure and rolls completed cycles into historic records.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Bank-Grade Token Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Argon2id password hashing, rotating JWT refresh token family reuse detection with instant revocation, and one-click remote session kill switch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
        {/* ==================================================================== */}
        <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/60 border border-white/[0.08] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.q}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 6: BOTTOM CALL TO ACTION */}
        {/* ==================================================================== */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600/20 via-slate-900/90 to-indigo-600/20 border border-white/[0.1] backdrop-blur-2xl text-center space-y-5 sm:space-y-6 shadow-2xl">
            <h2 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Experience Intelligent Tuition Management?
            </h2>
            <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join university tutors and parents across Bangladesh who trust TutorHub for structured memory,
              verifiable cycle transparency, and zero-fee matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap"
              >
                <span className="whitespace-nowrap">Create Free Account</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/teachers"
                className="w-full sm:w-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/[0.08] transition-all whitespace-nowrap"
              >
                <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">Browse Tutors Directory</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* INTERACTIVE GUIDED INTRODUCTION TOUR MODAL (FIRST VISIT / REPLAY) */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* INTERACTIVE GUIDED INTRODUCTION TOUR MODAL (FIRST VISIT / REPLAY) */}
      {/* ==================================================================== */}
      {isTourOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col max-h-[calc(100dvh-28px)] relative">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={closeTour}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-10"
              aria-label="Close guided tour"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Tour Header */}
            <div className="pr-8 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-semibold mb-1 sm:mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Guided Introduction</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                Welcome to TutorHub!
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                Choose your role to see how TutorHub transforms your tuition experience:
              </p>
            </div>

            {/* Role Track Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl sm:rounded-2xl bg-slate-950 border border-white/[0.06] shrink-0 my-2">
              <button
                type="button"
                onClick={() => {
                  setTourRole('teacher');
                  setTourStep(0);
                }}
                className={`py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tourRole === 'teacher'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>I am a Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTourRole('guardian');
                  setTourStep(0);
                }}
                className={`py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tourRole === 'guardian'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>I am a Guardian</span>
              </button>
            </div>

            {/* Scrollable Step Content Card */}
            <div className="overflow-y-auto pr-0.5 space-y-3 my-1 flex-1 min-h-0">
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                    {currentSteps[tourStep].badge}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {currentSteps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTourStep(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          tourStep === i
                            ? 'w-5 sm:w-6 bg-emerald-400'
                            : 'w-2 bg-slate-700 hover:bg-slate-600'
                        }`}
                        aria-label={`Jump to step ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    {React.createElement(currentSteps[tourStep].icon, { className: 'h-4 w-4 sm:h-6 sm:w-6' })}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                      {currentSteps[tourStep].title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                      {currentSteps[tourStep].description}
                    </p>
                  </div>
                </div>

                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/90 border border-white/[0.06] text-[10px] sm:text-[11px] text-emerald-300 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{currentSteps[tourStep].highlight}</span>
                </div>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08] shrink-0 gap-2">
              <button
                type="button"
                onClick={closeTour}
                className="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap py-1"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setTourStep(tourStep - 1)}
                    className="h-8 sm:h-10 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] sm:text-xs transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                )}

                {tourStep < currentSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep(tourStep + 1)}
                    className="h-8 sm:h-10 px-3.5 sm:px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href={tourRole === 'teacher' ? '/register' : '/teachers'}
                    onClick={closeTour}
                    className="h-8 sm:h-10 px-3.5 sm:px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all whitespace-nowrap"
                  >
                    <span>{tourRole === 'teacher' ? 'Start as Tutor' : 'Explore Tutors'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Semantic Footer */}
      <footer className="border-t border-white/[0.08] pt-8 pb-28 sm:py-10 bg-slate-950/90 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                TH
              </div>
              <span className="text-slate-300 font-semibold whitespace-nowrap">TutorHub Bangladesh</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400 text-xs">
              Empowering private educators &amp; guardians across Bangladesh.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <Link href="/teachers" className="hover:text-emerald-400 transition-colors whitespace-nowrap py-1">
              Find Tutors
            </Link>
            <Link href="/marketplace" className="hover:text-emerald-400 transition-colors whitespace-nowrap py-1">
              Tuition Board
            </Link>
            <Link href="/profile" className="hover:text-emerald-400 transition-colors whitespace-nowrap py-1">
              Profile
            </Link>
            <button
              type="button"
              onClick={() => openTourManual('teacher')}
              className="hover:text-emerald-400 transition-colors cursor-pointer whitespace-nowrap py-1"
            >
              Platform Tour
            </button>
          </div>
        </div>
      </footer>

      {/* Shared Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
