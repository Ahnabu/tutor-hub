'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import {
  GraduationCap,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  BookOpen,
  Send,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

interface TuitionItem {
  id: string;
  title: string;
  students: Array<{ name: string; classGrade: string }>;
  scheduleConfig: {
    targetDaysPerCycle: number;
    weeklyDays: string[];
  };
  currentCycle: {
    cycleNumber: number;
    completedDays: number;
    monthlyFee: number;
    amountPaid: number;
    paymentStatus: string;
  };
  teacher: {
    id: string;
    name: string;
    avatarUrl?: string;
    institution?: string;
    isVerified: boolean;
  };
}

interface ContactRequestItem {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reasonOrNote?: string;
  createdAt: string;
  teacher: {
    id: string;
    name: string;
    institution?: string;
    phone?: string;
    email?: string;
    slug?: string;
  };
}

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  // If a guardian lands here with a direct transparency token (?token=...), redirect to the PIN verification view page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        window.location.replace(`/guardian/view/${encodeURIComponent(token)}`);
      }
    }
  }, []);

  // 1. Fetch Claimed Tuitions
  const { data: tuitionsData, isLoading: isTuitionsLoading } = useQuery<{
    tuitions: TuitionItem[];
  }>({
    queryKey: ['guardian-tuitions'],
    queryFn: async () => {
      const res = await api.get('/guardian/tuitions');
      return res.data.data;
    },
    enabled: !!user,
  });

  // 2. Fetch Contact Requests
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery<{
    requests: ContactRequestItem[];
  }>({
    queryKey: ['guardian-contact-requests'],
    queryFn: async () => {
      const res = await api.get('/contact-requests/mine');
      return res.data.data;
    },
    enabled: !!user,
  });

  const tuitions = tuitionsData?.tuitions || [];
  const requests = requestsData?.requests || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Header */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900/80 to-indigo-500/10 border border-white/[0.08] backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  GUARDIAN PORTAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome, {user?.name?.split(' ')[0] || 'Guardian'}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track live class cycles, attendance logs, and verified tutor communications.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsSecurityOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/[0.08] transition-all cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Account Security</span>
              </button>

              <Link
                href="/teachers"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all text-center"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Browse Tutors Directory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 1: ACTIVE TUITION CONTRACTS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Active Tuitions</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {tuitions.length} contract{tuitions.length === 1 ? '' : 's'}
            </span>
          </div>

          {isTuitionsLoading ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Loading tuitions...</span>
            </div>
          ) : tuitions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06]">
              <GraduationCap className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No active tuition contracts linked</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 max-w-md mx-auto">
                Ask your tutor to share their transparency link with your phone number ({user?.phone || 'registered phone'}), or browse verified tutors.
              </p>
              <Link
                href="/teachers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>Find a Verified Tutor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tuitions.map((t) => {
                const cycle = t.currentCycle;
                const target = t.scheduleConfig.targetDaysPerCycle || 12;
                const percent = Math.min(100, Math.round((cycle.completedDays / target) * 100));

                return (
                  <div
                    key={t.id}
                    className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white">{t.title}</h3>
                          <span className="text-xs text-slate-400">
                            Student: {t.students.map((s) => s.name).join(', ')}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${
                            cycle.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : cycle.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {cycle.paymentStatus}
                        </span>
                      </div>

                      {/* Tutor Info */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.05] mb-4">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {t.teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{t.teacher.name}</span>
                            {t.teacher.isVerified && (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {t.teacher.institution || 'Private Tutor'}
                          </span>
                        </div>
                      </div>

                      {/* Cycle Progress */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Cycle {cycle.cycleNumber} Progress</span>
                          <span className="text-emerald-400 font-bold">
                            {cycle.completedDays} / {target} Classes
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.05]">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                          <span>Fee: {cycle.monthlyFee.toLocaleString()} BDT</span>
                          <span>Paid: {cycle.amountPaid.toLocaleString()} BDT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: GATED CONTACT REQUESTS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-400" />
              <span>Contact Access Requests</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {requests.length} request{requests.length === 1 ? '' : 's'}
            </span>
          </div>

          {isRequestsLoading ? (
            <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-slate-400 text-xs">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-400">
              You haven&apos;t requested contact info for any tutors yet.{' '}
              <Link href="/teachers" className="text-emerald-400 hover:underline">
                Explore the tutor directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => {
                const isApproved = r.status === 'APPROVED';

                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{r.teacher.name}</h4>
                        <span className="text-xs text-slate-400">
                          {r.teacher.institution || 'Verified Tutor'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    {isApproved && r.teacher.phone ? (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">
                          Verified Contact Details:
                        </span>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <a
                            href={`tel:${r.teacher.phone}`}
                            className="flex items-center gap-1.5 text-white font-mono hover:text-emerald-400 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{r.teacher.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/${r.teacher.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[#25D366] hover:underline"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          {r.teacher.email && (
                            <a
                              href={`mailto:${r.teacher.email}`}
                              className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{r.teacher.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">
                        {r.status === 'PENDING'
                          ? 'Awaiting tutor approval. Once approved, their direct mobile number and WhatsApp link will appear here.'
                          : 'This contact request was declined by the tutor.'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: MY TUITION BOARD POSTINGS */}
        <GuardianMarketplacePostsSection />
      </main>

      {/* Security & Password Modal */}
      {isSecurityOpen && (
        <GuardianSecurityModal onClose={() => setIsSecurityOpen(false)} />
      )}

      <BottomNav />
    </div>
  );
}

function GuardianMarketplacePostsSection() {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [loadingApps, setLoadingApps] = React.useState(false);

  const fetchMyPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/marketplace/my-posts');
      if (res.data?.success) {
        setPosts(res.data.data.posts || []);
      }
    } catch {
      // quiet fail
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchMyPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const openApplicantsModal = async (postId: string) => {
    try {
      setSelectedPostId(postId);
      setLoadingApps(true);
      const res = await api.get(`/marketplace/posts/${postId}/applications`);
      if (res.data?.success) {
        setApplications(res.data.data.applications || []);
      }
    } catch {
      // quiet fail
    } finally {
      setLoadingApps(false);
    }
  };

  const handleAcceptApplication = async (appId: string) => {
    try {
      const res = await api.post(`/marketplace/applications/${appId}/respond`, {
        action: 'ACCEPT',
      });
      if (res.data?.success) {
        toast.success('Tutor application accepted! Direct contacts have been unlocked.');
        if (selectedPostId) openApplicantsModal(selectedPostId);
        fetchMyPosts();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Could not accept application.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>My Tuition Board Postings</span>
        </h2>
        <Link
          href="/marketplace/create"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
        >
          + Post Requirement
        </Link>
      </div>

      {loading ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-400">
          Loading your postings...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-400">
          You haven&apos;t posted any tuition requirements yet.{' '}
          <Link href="/marketplace/create" className="text-indigo-400 hover:underline">
            Post a requirement now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ৳{p.budgetAmount?.toLocaleString()} / mo
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                      p.status === 'HIRED'
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                        : p.status === 'CLOSED'
                        ? 'bg-slate-800 text-slate-400 border-white/[0.06]'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                <p className="text-xs text-slate-400 mb-3">
                  {p.location?.area} • {p.daysPerWeek ? `${p.daysPerWeek} days/week` : p.targetDaysPerMonth ? `${p.targetDaysPerMonth} days/month` : ''}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {p.applicationCount} applicant(s)
                </span>
                <button
                  type="button"
                  onClick={() => openApplicantsModal(p.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors whitespace-nowrap shrink-0"
                >
                  View Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicants Modal */}
      {selectedPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D1322] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Tutor Applicants</h3>
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingApps ? (
                <p className="text-xs text-slate-400 text-center py-8">Loading applicants...</p>
              ) : applications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No tutors have applied to this requirement yet.
                </p>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{app.teacher?.name}</p>
                        <p className="text-slate-400 text-[11px]">
                          {app.teacher?.institution || 'Verified Tutor'} • {app.teacher?.department}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-white/[0.04]">
                      "{app.message}"
                    </p>

                    {app.status === 'ACCEPTED' && app.teacher?.phone && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold">
                          {app.teacher.phone}
                        </span>
                        <a
                          href={`https://wa.me/${app.teacher.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-[#25D366] hover:underline"
                        >
                          Chat WhatsApp
                        </a>
                      </div>
                    )}

                    {app.status === 'PENDING' && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleAcceptApplication(app.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          Accept Tutor & Unlock Contact
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// GUARDIAN ACCOUNT SECURITY MODAL (Internal Box-Level Scrolling)
// ==============================================================================
function GuardianSecurityModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await api.post('/auth/logout-all');
      toast.success('Signed out of all other devices successfully.');
    } catch {
      toast.error('Could not sign out of other devices.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
        {/* Fixed Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Guardian Account Security</h3>
              <p className="text-xs text-slate-400">Configure password and remote device sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body - SCROLL ON THE BOX */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
          {/* Account Details Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Profile Information
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Name:</span>
                <span className="font-semibold text-white">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="font-semibold text-emerald-400 truncate block">{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <span className="font-semibold text-white">{user?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Role:</span>
                <span className="font-mono text-emerald-400 font-bold">GUARDIAN</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Change Password</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password (Min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword || !currentPassword || !newPassword}
                className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {changingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Remote Sessions */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white">Remote Device Sessions</h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Sign out from all other active sessions and revoke existing refresh tokens across all devices.
            </p>
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={loggingOutAll}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-2 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
            >
              {loggingOutAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Sign Out of Other Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
