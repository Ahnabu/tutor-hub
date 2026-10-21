'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import {
  GraduationCap,
  CheckCircle2,
  Calendar,
  BookOpen,
  CreditCard,
  Lock,
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SessionEntry {
  subject: string;
  attendance: string;
  topicsTaught: string;
  unfinishedTopics?: string;
  homeworkAssigned?: string;
  previousHomeworkStatus?: string;
}

interface SessionLogItem {
  id: string;
  sessionDate: string;
  durationMinutes: number;
  entries: SessionEntry[];
  guardianVisibleRemarks?: string;
}

interface TuitionViewData {
  id: string;
  title: string;
  students: Array<{ name: string; classGrade: string; subjects: string[] }>;
  scheduleConfig: {
    billingModel: string;
    targetDaysPerCycle: number;
    weeklyDays: string[];
    durationMinutes: number;
  };
  currentCycle: {
    cycleNumber: number;
    completedDays: number;
    extraClassesCount: number;
    cycleStartDate: string;
    monthlyFee: number;
    paymentStatus: string;
    amountPaid: number;
  };
  payments: Array<{
    amount: number;
    method: string;
    paidAt: string;
    reference?: string;
  }>;
  recentSessions: SessionLogItem[];
  teacher: {
    name: string;
    avatarUrl?: string;
    institution?: string;
    isVerified: boolean;
  };
}

export default function GuardianPortalViewPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [submittingPin, setSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Fetch tuition view data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ requiresPin: boolean; tuition?: TuitionViewData }>({
    queryKey: ['guardian-tuition-view', token],
    queryFn: async () => {
      const res = await api.get(`/guardian/view/${token}`);
      return res.data.data;
    },
    enabled: !!token,
    retry: 1,
  });

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setSubmittingPin(true);

    try {
      await api.post(`/guardian/view/${token}/verify-pin`, { pin: pin.trim() });
      showSuccessToast('Access unlocked!');
      await refetch();
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Incorrect PIN. Please try again.');
      setPinError(msg);
    } finally {
      setSubmittingPin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span className="text-sm font-medium">Loading guardian portal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-8 text-center shadow-2xl">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-slate-400 mb-6">
              This tuition tracking link is invalid, has expired, or has been revoked by the tutor.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. PIN CHALLENGE MODAL
  if (data?.requiresPin) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-slate-900/70 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Guardian PIN Verification
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                This tuition transparency link is PIN-protected. Please enter the 4-digit PIN
                provided by your tutor.
              </p>
            </div>

            {pinError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  autoFocus
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full h-12 pl-4 pr-11 rounded-xl bg-slate-950/80 border border-white/[0.1] text-lg text-white font-mono text-center tracking-widest placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={submittingPin || !pin.trim()}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {submittingPin ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying PIN...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const tuition = data?.tuition;
  if (!tuition) return null;

  const cycle = tuition.currentCycle;
  const targetDays = tuition.scheduleConfig.targetDaysPerCycle || 12;
  const progressPercent = Math.min(100, Math.round((cycle.completedDays / targetDays) * 100));

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900/80 to-indigo-500/10 border border-white/[0.08] backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  GUARDIAN TRANSPARENCY PORTAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {tuition.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Student: {tuition.students.map((s) => `${s.name} (${s.classGrade})`).join(', ')}
              </p>
            </div>

            {/* Teacher Badge */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {tuition.teacher.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{tuition.teacher.name}</span>
                  {tuition.teacher.isVerified && (
                    <span title="Verified Tutor">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {tuition.teacher.institution || 'Verified Private Tutor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cycle Progress Card */}
        <div className="mb-8 p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Current Cycle Status
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Cycle {cycle.cycleNumber}: {cycle.completedDays} of {targetDays} Classes Completed
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                  cycle.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : cycle.paymentStatus === 'PARTIAL'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                Payment: {cycle.paymentStatus}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 mb-4 overflow-hidden border border-white/[0.06] p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/[0.05] text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">Monthly Fee</span>
              <span className="text-white font-bold text-sm">
                {cycle.monthlyFee.toLocaleString()} BDT
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Amount Paid</span>
              <span className="text-emerald-400 font-bold text-sm">
                {cycle.amountPaid.toLocaleString()} BDT
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Due Remaining</span>
              <span className="text-rose-400 font-bold text-sm">
                {Math.max(0, cycle.monthlyFee - cycle.amountPaid).toLocaleString()} BDT
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Weekly Days</span>
              <span className="text-slate-200 font-bold text-sm">
                {tuition.scheduleConfig.weeklyDays.join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Session History Feed with Next-Day Memory */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Class Attendance & Lesson Log</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {tuition.recentSessions.length} sessions logged
            </span>
          </div>

          {tuition.recentSessions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-slate-400 text-sm">
              No class sessions have been logged in this cycle yet.
            </div>
          ) : (
            <div className="space-y-4">
              {tuition.recentSessions.map((session, idx) => {
                const entry = session.entries[0];
                return (
                  <div
                    key={session.id || idx}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                          Class #{tuition.recentSessions.length - idx}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {new Date(session.sessionDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{session.durationMinutes}m</span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                          entry?.attendance === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {entry?.attendance || 'PRESENT'}
                      </span>
                    </div>

                    {/* Topics Taught */}
                    {entry && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-white/[0.05]">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Topics Covered ({entry.subject})
                          </span>
                          <p className="text-xs text-slate-200">{entry.topicsTaught}</p>
                        </div>

                        {entry.homeworkAssigned && (
                          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/[0.04] mt-2">
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                              Homework Assigned
                            </span>
                            <p className="text-xs text-slate-300">{entry.homeworkAssigned}</p>
                          </div>
                        )}

                        {session.guardianVisibleRemarks && (
                          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 mt-2">
                            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block mb-0.5">
                              Tutor Remarks
                            </span>
                            <p className="text-xs text-indigo-100 italic">
                              &ldquo;{session.guardianVisibleRemarks}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
