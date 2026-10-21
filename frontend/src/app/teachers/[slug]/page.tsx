'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import {
  GraduationCap,
  CheckCircle2,
  MapPin,
  BookOpen,
  Briefcase,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Copy,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';

interface PublicTeacher {
  id: string;
  name: string;
  avatarUrl?: string;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered: string[];
  preferredAreas: string[];
  expectedRateRange?: string;
  isVerifiedTutor: boolean;
  slug?: string;
}

interface RevealedContact {
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export default function TeacherProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Fetch Public Teacher Details
  const { data, isLoading, isError } = useQuery<{ teacher: PublicTeacher }>({
    queryKey: ['teacher-public-profile', slug],
    queryFn: async () => {
      const res = await api.get(`/teachers/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  const teacher = data?.teacher;

  // 2. If logged in as Guardian, check if contact has already been granted
  const isGuardian = user?.roles?.includes('GUARDIAN');
  const {
    data: revealedData,
    refetch: refetchContact,
  } = useQuery<{ contact: RevealedContact }>({
    queryKey: ['revealed-contact', teacher?.id],
    queryFn: async () => {
      if (!teacher?.id) throw new Error('Missing teacher id');
      const res = await api.get(`/contact-requests/revealed/${teacher.id}`);
      return res.data.data;
    },
    enabled: !!teacher?.id && !!isGuardian,
    retry: false,
  });

  const revealedContact = revealedData?.contact;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setSubmittingRequest(true);

    try {
      await api.post('/contact-requests', {
        targetTeacherId: teacher.id,
        reasonOrNote: reason.trim() || undefined,
      });

      showSuccessToast('Contact request sent! The tutor will review and approve your request shortly.');
      setIsModalOpen(false);
      setReason('');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to send contact request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const copyPhone = () => {
    if (!revealedContact?.phone) return;
    navigator.clipboard.writeText(revealedContact.phone);
    setCopied(true);
    showSuccessToast('Phone number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/60 border border-white/[0.08] rounded-2xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Tutor Profile Not Found</h2>
            <p className="text-xs text-slate-400 mb-6">
              This tutor profile is currently private, under review, or does not exist.
            </p>
            <Link
              href="/teachers"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Browse Other Tutors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-16">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Profile Hero Card */}
        <div className="p-8 rounded-3xl bg-slate-900/70 border border-white/[0.08] backdrop-blur-2xl shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-3xl shadow-xl shadow-emerald-500/10 shrink-0">
                {teacher.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {teacher.name}
                  </h1>
                  {teacher.isVerifiedTutor && (
                    <span
                      title="Verified Identity & University Credentials"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 font-medium">
                  {teacher.institution || 'Verified Private Tutor'}
                  {teacher.department ? ` • ${teacher.department}` : ''}
                  {teacher.batchOrYear ? ` (${teacher.batchOrYear})` : ''}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                  {typeof teacher.experienceYears === 'number' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{teacher.experienceYears}+ years experience</span>
                    </span>
                  )}

                  <span className="font-mono text-slate-300">
                    Rate: <strong className="text-white">{teacher.expectedRateRange || 'Negotiable'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Bio */}
            {teacher.bio && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
                <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-3">
                  About the Tutor
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {teacher.bio}
                </p>
              </div>
            )}

            {/* Subjects Offered */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Subjects Offered</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {teacher.subjectsOffered.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/[0.06] text-xs text-white font-medium shadow-sm"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Tuition Areas */}
            {teacher.preferredAreas.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
                <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span>Preferred Areas (Home Tutoring / In-Person)</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.preferredAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy-Gated Contact Card (Right 1 col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-emerald-500/20 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Direct Contact</h3>
              </div>

              {revealedContact?.phone ? (
                /* Contact Granted State */
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Contact access approved!</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Mobile Number:
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/[0.08]">
                      <span className="font-mono text-sm text-white font-bold">
                        {revealedContact.phone}
                      </span>
                      <button
                        onClick={copyPhone}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                        title="Copy phone"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href={`tel:${revealedContact.phone}`}
                      className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Tutor</span>
                    </a>

                    <a
                      href={`https://wa.me/${revealedContact.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {revealedContact.email && (
                    <div className="pt-2 text-xs text-slate-400 font-mono">
                      <span>Email: </span>
                      <a href={`mailto:${revealedContact.email}`} className="text-emerald-400 hover:underline">
                        {revealedContact.email}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Contact Gated State */
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Direct phone and WhatsApp details are gated to protect tutor privacy. Send a quick
                    verification request to connect directly.
                  </p>

                  {!user ? (
                    <div className="space-y-2 pt-2">
                      <Link
                        href="/login"
                        className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <span>Log in as Guardian to Request</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <p className="text-[11px] text-center text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-emerald-400 hover:underline">
                          Register free
                        </Link>
                      </p>
                    </div>
                  ) : isGuardian ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Request Direct Contact</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      You are logged in with a Teacher profile. Switch or register a Guardian account to request tutor contact.
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/[0.05] text-[11px] text-slate-500 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>Protected by TutorHub Identity Verification</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* REQUEST CONTACT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Request Contact Details</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send a request to <strong>{teacher.name}</strong>. Introduce your requirement (student class, subjects, and area).
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Message / Requirement Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Looking for HSC 2026 Physics tutor for my son in Dhanmondi. 3 days a week."
                  className="w-full p-3 bg-slate-950 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingRequest ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
