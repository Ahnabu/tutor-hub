'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  CreditCard,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  Plus,
  Share2,
  Sparkles,
  X,
  AlertCircle,
  Inbox,
  UserCheck,
} from 'lucide-react';

interface Student {
  _id?: string;
  name: string;
  classGrade: string;
  curriculum?: string;
  subjects: string[];
  isActive?: boolean;
}

interface CurrentCycle {
  cycleNumber: number;
  completedDays: number;
  extraClassesCount: number;
  cycleStartDate: string;
  readyToClose: boolean;
  monthlyFee: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  amountPaid: number;
}

interface Tuition {
  _id: string;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  students: Student[];
  scheduleConfig: {
    billingModel: string;
    targetDaysPerCycle: number;
    weeklyDays: string[];
    preferredTime?: string;
    durationMinutes: number;
  };
  currentCycle: CurrentCycle;
  guardianAccess?: {
    guardianLabel?: string;
    linkStatus: string;
  };
}

interface MemoryPrefill {
  lastSessionDate?: string;
  lastSessionNumber?: number;
  entries: Array<{
    studentId: string;
    studentName: string;
    subject: string;
    unfinishedTopics?: string;
    homeworkAssigned?: string;
    nextClassPlan?: string;
  }>;
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedTuitionForSession, setSelectedTuitionForSession] = useState<Tuition | null>(null);
  const [selectedTuitionForPayment, setSelectedTuitionForPayment] = useState<Tuition | null>(null);
  const [selectedTuitionForShare, setSelectedTuitionForShare] = useState<Tuition | null>(null);

  // Fetch Tuitions
  const { data: tuitions = [], isLoading } = useQuery<Tuition[]>({
    queryKey: ['teacher-tuitions'],
    queryFn: async () => {
      const res = await api.get('/tuitions');
      return res.data.data.tuitions;
    },
  });

  // Fetch incoming contact requests
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['teacher-incoming-requests'],
    queryFn: async () => {
      const res = await api.get('/contact-requests/incoming');
      return res.data.data.requests;
    },
  });
  const pendingRequestsCount = (incomingRequests as Array<{ status: string }>).filter(
    (r) => r.status === 'PENDING'
  ).length;

  // Calculate High-Level Metrics
  const activeTuitions = tuitions.filter((t) => t.status === 'ACTIVE');
  const totalMonthlyIncome = activeTuitions.reduce((acc, t) => acc + (t.currentCycle?.monthlyFee || 0), 0);
  const totalReceived = activeTuitions.reduce((acc, t) => acc + (t.currentCycle?.amountPaid || 0), 0);
  const pendingAmount = Math.max(0, totalMonthlyIncome - totalReceived);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900/60 to-indigo-500/10 border border-white/[0.08] backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                TEACHER CONTROL PLANE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage student schedules, Next-Day Memory logs, and cycle payments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsRequestsOpen(true)}
              className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-white/[0.08] transition-all cursor-pointer relative"
            >
              <Inbox className="h-4 w-4 text-emerald-400" />
              <span>Contact Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-white/[0.08] transition-all cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-indigo-400" />
              <span>Profile & Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create New Tuition</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Active Tuitions</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {activeTuitions.length} Batches
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Real-time active cycles
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Expected Billing</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {totalMonthlyIncome.toLocaleString()} BDT
            </div>
            <div className="text-[11px] text-slate-400 mt-1">For ongoing cycles</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Collected Revenue</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {totalReceived.toLocaleString()} BDT
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Payment verified</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Due Balance</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {pendingAmount.toLocaleString()} BDT
            </div>
            <div className="text-[11px] text-amber-400 mt-1">Pending collection</div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            <span>Active Student Agreements</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {activeTuitions.length} contracts running
          </span>
        </div>

        {/* Tuition Cards List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
            <p className="text-sm">Loading your tuitions & cycle logs...</p>
          </div>
        ) : activeTuitions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-white/[0.1] text-center">
            <BookOpen className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No active tuitions yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              Start by creating your first student contract. You can track attendance, log daily
              homework, and automate cycle payments effortlessly.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Tuition</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTuitions.map((tuition) => {
              const student = tuition.students[0] || { name: 'Student', classGrade: '', subjects: [] };
              const cycle = tuition.currentCycle;
              const target = tuition.scheduleConfig?.targetDaysPerCycle || 12;
              const percent = Math.min(100, Math.round((cycle.completedDays / target) * 100));

              return (
                <div
                  key={tuition._id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Student Name & Payment Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {student.classGrade} {student.curriculum ? `• ${student.curriculum}` : ''}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
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

                    {/* Subject Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {student.subjects?.map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-white/[0.04]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>

                    {/* Cycle Progress Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.05] mb-5">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                        <span className="text-slate-400">Cycle {cycle.cycleNumber} Progress</span>
                        <span className="text-emerald-400 font-bold">
                          {cycle.completedDays} / {target} Days
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Fee: {cycle.monthlyFee.toLocaleString()} BDT</span>
                        <span>Paid: {cycle.amountPaid.toLocaleString()} BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForSession(tuition)}
                      className="h-9 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/20 transition-all cursor-pointer"
                      title="Log Day with Next-Day Memory Prefill"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Log Day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForPayment(tuition)}
                      className="h-9 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-white/[0.05] transition-all cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForShare(tuition)}
                      className="h-9 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-white/[0.05] transition-all cursor-pointer"
                      title="Share Guardian Portal Link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: Create New Tuition */}
      {isCreateOpen && (
        <CreateTuitionModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            queryClient.invalidateQueries({ queryKey: ['teacher-tuitions'] });
          }}
        />
      )}

      {/* MODAL: Log Session with Next-Day Memory */}
      {selectedTuitionForSession && (
        <LogSessionModal
          tuition={selectedTuitionForSession}
          onClose={() => setSelectedTuitionForSession(null)}
          onSuccess={() => {
            setSelectedTuitionForSession(null);
            queryClient.invalidateQueries({ queryKey: ['teacher-tuitions'] });
          }}
        />
      )}

      {/* MODAL: Record Payment */}
      {selectedTuitionForPayment && (
        <RecordPaymentModal
          tuition={selectedTuitionForPayment}
          onClose={() => setSelectedTuitionForPayment(null)}
          onSuccess={() => {
            setSelectedTuitionForPayment(null);
            queryClient.invalidateQueries({ queryKey: ['teacher-tuitions'] });
          }}
        />
      )}

      {/* MODAL: Guardian Share Link */}
      {selectedTuitionForShare && (
        <GuardianShareModal
          tuition={selectedTuitionForShare}
          onClose={() => setSelectedTuitionForShare(null)}
        />
      )}

      {/* MODAL: Incoming Contact Requests */}
      {isRequestsOpen && (
        <IncomingRequestsModal
          onClose={() => setIsRequestsOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['teacher-incoming-requests'] });
          }}
        />
      )}

      {/* MODAL: Profile & Verification */}
      {isProfileOpen && (
        <TeacherProfileModal
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ==============================================================================
// 1. CREATE TUITION MODAL
// ==============================================================================
function CreateTuitionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState('Class 9');
  const [subjects, setSubjects] = useState('Physics, Math');
  const [monthlyFee, setMonthlyFee] = useState('8000');
  const [targetDays, setTargetDays] = useState('12');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedGuardianPhone = guardianPhone.trim();
    if (!trimmedGuardianPhone) {
      const msg = 'Guardian phone number is required';
      setError(msg);
      showErrorToast(new Error(msg));
      return;
    }

    setLoading(true);

    try {
      const subjectList = subjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/tuitions', {
        title: `${studentName} — ${classGrade}`,
        students: [
          {
            name: studentName.trim(),
            classGrade,
            subjects: subjectList.length > 0 ? subjectList : ['General'],
            isActive: true,
          },
        ],
        scheduleConfig: {
          billingModel: 'MONTHLY_CYCLE',
          targetDaysPerCycle: parseInt(targetDays, 10) || 12,
          weeklyDays: ['SUN', 'TUE', 'THU'],
          durationMinutes: 90,
        },
        monthlyFee: parseFloat(monthlyFee) || 0,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: trimmedGuardianPhone,
      });

      showSuccessToast('Tuition contract created successfully!');
      onSuccess();
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Failed to create tuition contract');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Create Student Agreement</h3>
        <p className="text-xs text-slate-400 mb-5">
          Set up a new tuition cycle, student grade, and billing schedule.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Abrar Fahim"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Class / Grade *</label>
              <input
                type="text"
                required
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                placeholder="e.g. Class 10 / HSC"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Subjects (comma separated) *
            </label>
            <input
              type="text"
              required
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Physics, Higher Math, ICT"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Monthly Fee (BDT) *</label>
              <input
                type="number"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                placeholder="8000"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Days Per Cycle *</label>
              <input
                type="number"
                required
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
                placeholder="12"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.05]">
            <span className="text-xs font-semibold text-slate-300">
              Guardian Information <span className="text-emerald-400">*</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Guardian's Name (e.g. Mr. Khan)"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Guardian Phone: 017XXXXXXXX *"
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save & Launch Cycle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================
// 2. LOG SESSION MODAL (WITH NEXT-DAY MEMORY PREFILL)
// ==============================================================================
function LogSessionModal({
  tuition,
  onClose,
  onSuccess,
}: {
  tuition: Tuition;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const student = tuition.students[0] || { name: 'Student', subjects: ['General'] };

  // Fetch Next-Day Memory Prefill
  const { data: prefill, isLoading: isPrefillLoading } = useQuery<MemoryPrefill>({
    queryKey: ['session-prefill', tuition._id],
    queryFn: async () => {
      const res = await api.get(`/tuitions/${tuition._id}/sessions/prefill`);
      return res.data.data;
    },
  });

  const lastEntry = prefill?.entries?.[0];

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('90');
  const [topicsTaught, setTopicsTaught] = useState('');
  const [unfinishedTopics, setUnfinishedTopics] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState('');
  const [homeworkStatus, setHomeworkStatus] = useState<'COMPLETED' | 'PARTIAL' | 'NOT_DONE'>('COMPLETED');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/tuitions/${tuition._id}/sessions`, {
        clientRequestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sessionDate: new Date(date).toISOString(),
        sessionLocalDate: date,
        durationMinutes: parseInt(duration, 10) || 90,
        sessionType: 'REGULAR',
        entries: [
          {
            studentId: student._id || tuition.students[0]._id,
            attendance: 'PRESENT',
            subject: student.subjects[0] || 'General',
            topicsTaught: topicsTaught.trim(),
            unfinishedTopics: unfinishedTopics.trim() || undefined,
            homeworkAssigned: homeworkAssigned.trim() || undefined,
            previousHomeworkStatus: homeworkStatus,
          },
        ],
        guardianVisibleRemarks: remarks.trim() || undefined,
      });

      showSuccessToast('Class session and Next-Day memory logged!');
      onSuccess();
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Failed to log session');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            DAY {tuition.currentCycle.completedDays + 1} LOGGING
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Log Daily Session: {student.name}</h3>

        {/* Next-Day Memory Highlight Card */}
        {isPrefillLoading ? (
          <div className="p-4 my-4 rounded-xl bg-slate-950/60 border border-white/[0.05] text-xs text-slate-400 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Loading Next-Day Memory from previous session...</span>
          </div>
        ) : lastEntry && (lastEntry.unfinishedTopics || lastEntry.homeworkAssigned) ? (
          <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-950/80 to-emerald-500/10 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Day Memory Prefill (From {prefill?.lastSessionDate})</span>
            </div>
            {lastEntry.unfinishedTopics && (
              <p className="text-xs text-slate-300">
                <strong className="text-amber-300">Unfinished Topics to Cover:</strong>{' '}
                {lastEntry.unfinishedTopics}
              </p>
            )}
            {lastEntry.homeworkAssigned && (
              <p className="text-xs text-slate-300 mt-1">
                <strong className="text-emerald-300">Homework Assigned Last Day:</strong>{' '}
                {lastEntry.homeworkAssigned}
              </p>
            )}
          </div>
        ) : null}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Session Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Topics Taught Today *</label>
            <textarea
              required
              rows={2}
              value={topicsTaught}
              onChange={(e) => setTopicsTaught(e.target.value)}
              placeholder="e.g. Chapter 4: Work, Energy and Power - Mathematical problems"
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-amber-400/90 mb-1">
                Unfinished Topics (Pre-fill next session)
              </label>
              <input
                type="text"
                value={unfinishedTopics}
                onChange={(e) => setUnfinishedTopics(e.target.value)}
                placeholder="e.g. Efficiency formulas & graph"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-emerald-400/90 mb-1">
                New Homework Assigned
              </label>
              <input
                type="text"
                value={homeworkAssigned}
                onChange={(e) => setHomeworkAssigned(e.target.value)}
                placeholder="e.g. Exercise 4.2: 1 to 5"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Last Day Homework Status</label>
            <div className="flex gap-2">
              {(['COMPLETED', 'PARTIAL', 'NOT_DONE'] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setHomeworkStatus(status)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    homeworkStatus === status
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-white/[0.05]'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Remarks for Guardian (Visible on Portal)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Performed very well in problem solving today."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save & Complete Day</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================
// 3. RECORD PAYMENT MODAL
// ==============================================================================
function RecordPaymentModal({
  tuition,
  onClose,
  onSuccess,
}: {
  tuition: Tuition;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cycle = tuition.currentCycle;
  const remainingDue = Math.max(0, cycle.monthlyFee - cycle.amountPaid);

  const [amount, setAmount] = useState(remainingDue.toString());
  const [method, setMethod] = useState<'BKASH' | 'NAGAD' | 'CASH' | 'BANK'>('BKASH');
  const [reference, setReference] = useState('');
  const [advanceCycle, setAdvanceCycle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(`/tuitions/${tuition._id}/record-payment`, {
        amount: parseFloat(amount) || 0,
        method,
        reference: reference.trim() || undefined,
        advanceCycle,
      });

      showSuccessToast('Payment recorded successfully!');
      onSuccess();
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Failed to record payment');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Record Tuition Payment</h3>
        <p className="text-xs text-slate-400 mb-4">
          Cycle {cycle.cycleNumber}: Total Fee {cycle.monthlyFee.toLocaleString()} BDT (Due:{' '}
          {remainingDue.toLocaleString()} BDT)
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Amount Paid (BDT) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {(['BKASH', 'NAGAD', 'CASH', 'BANK'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    method === m
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950 text-slate-400 border-white/[0.05]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Transaction ID / Note (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TrxID: 98AB721"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={advanceCycle}
              onChange={(e) => setAdvanceCycle(e.target.checked)}
              className="rounded bg-slate-950 border-white/[0.1] text-emerald-500 focus:ring-0"
            />
            <span>Archive cycle & advance to Cycle {cycle.cycleNumber + 1}</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Confirm Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================
// 4. GUARDIAN SHARE MODAL
// ==============================================================================
function GuardianShareModal({
  tuition,
  onClose,
}: {
  tuition: Tuition;
  onClose: () => void;
}) {
  const [pin, setPin] = useState('1234');
  const [shareData, setShareData] = useState<{
    shareToken: string;
    accessPin?: string;
    linkUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/tuitions/${tuition._id}/share-token`, {
        accessPin: pin.trim() || undefined,
      });
      setShareData(res.data.data);
      showSuccessToast('Guardian transparency link generated!');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to generate guardian link');
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = shareData
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${shareData.linkUrl}`
    : '';

  const copyToClipboard = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    showSuccessToast('Guardian portal link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Guardian Transparency Link</h3>
        <p className="text-xs text-slate-400 mb-5">
          Share a PIN-protected link with the guardian to view real-time class attendance,
          homework, and payments with zero login hassle.
        </p>

        {!shareData ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                4-Digit Access PIN (Guardian must enter this)
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white font-mono text-center tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              <span>Generate Share Link</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer hover:bg-emerald-400"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <strong>Guardian PIN:</strong>{' '}
              <span className="font-mono text-white text-sm ml-1 font-bold">{pin}</span>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                Provide this PIN to the guardian along with the link.
              </p>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hello! Here is the progress and attendance tracking link for ${tuition.students[0]?.name}: ${fullUrl}\nAccess PIN: ${pin}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================================
// 5. INCOMING CONTACT REQUESTS MODAL
// ==============================================================================
function IncomingRequestsModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['teacher-incoming-requests'],
    queryFn: async () => {
      const res = await api.get('/contact-requests/incoming');
      return res.data.data.requests;
    },
  });

  const handleRespond = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setRespondingId(id);
    try {
      await api.post(`/contact-requests/${id}/respond`, { action });
      showSuccessToast(
        action === 'APPROVE'
          ? 'Contact request approved! The guardian can now see your phone & WhatsApp.'
          : 'Request declined.'
      );
      queryClient.invalidateQueries({ queryKey: ['teacher-incoming-requests'] });
      onSuccess();
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to update request status');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Inbox className="h-5 w-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Guardian Contact Requests</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Guardians who viewed your public profile and requested direct phone / WhatsApp communication.
        </p>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-white/[0.05] text-xs text-slate-400">
            No contact requests received yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {requests.map((r: any) => {
              const isPending = r.status === 'PENDING';
              const isApproved = r.status === 'APPROVED';

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.guardian.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <span>{r.guardian.phone}</span>
                        {r.guardian.email && <span>• {r.guardian.email}</span>}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {r.reasonOrNote && (
                    <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-white/[0.04]">
                      &ldquo;{r.reasonOrNote}&rdquo;
                    </p>
                  )}

                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.05]">
                      <button
                        type="button"
                        disabled={respondingId === r.id}
                        onClick={() => handleRespond(r.id, 'REJECT')}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        disabled={respondingId === r.id}
                        onClick={() => handleRespond(r.id, 'APPROVE')}
                        className="h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
                      >
                        {respondingId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Approve Contact</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================================
// 6. TEACHER PROFILE & VERIFICATION MODAL
// ==============================================================================
function TeacherProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const profile = user?.teacherProfile;

  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [institution, setInstitution] = useState(profile?.institution || 'Dhaka University');
  const [department, setDepartment] = useState(profile?.department || 'Physics');
  const [batchOrYear, setBatchOrYear] = useState(profile?.batchOrYear || '2020');
  const [experienceYears, setExperienceYears] = useState(
    profile?.experienceYears?.toString() || '3'
  );
  const [bio, setBio] = useState(
    profile?.bio || 'Passionate physics and mathematics tutor specializing in HSC syllabus.'
  );
  const [subjects, setSubjects] = useState(
    profile?.subjectsOffered?.join(', ') || 'Physics, Higher Math'
  );
  const [areas, setAreas] = useState(
    profile?.preferredAreas?.join(', ') || 'Dhanmondi, Mirpur, Mohammadpur'
  );
  const [expectedRateRange, setExpectedRateRange] = useState(
    profile?.expectedRateRange || '8,000 - 12,000 BDT'
  );

  const [docUrl, setDocUrl] = useState('');
  const [docType, setDocType] = useState('National ID (NID)');
  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const areaList = areas.split(',').map((s) => s.trim()).filter(Boolean);

      await api.patch('/teachers/profile', {
        isPublic,
        institution: institution.trim() || undefined,
        department: department.trim() || undefined,
        batchOrYear: batchOrYear.trim() || undefined,
        experienceYears: parseInt(experienceYears, 10) || 0,
        bio: bio.trim() || undefined,
        subjectsOffered: subjectList,
        preferredAreas: areaList,
        expectedRateRange: expectedRateRange.trim() || undefined,
      });

      showSuccessToast('Public profile updated successfully!');
      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) return;
    setSubmittingDoc(true);

    try {
      await api.post('/teachers/verification', {
        docs: [
          {
            url: docUrl.trim(),
            publicId: `doc-${Date.now()}`,
            docType,
          },
        ],
      });

      showSuccessToast('Verification document submitted! Under review by administration.');
      setDocUrl('');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to submit document');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const verificationStatus = profile?.verificationStatus || 'UNSUBMITTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Public Profile & Verification</h3>
        <p className="text-xs text-slate-400 mb-6">
          Customize your tutor directory card and submit credentials for background verification.
        </p>

        {/* Verification Status Banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-white block">Verification Badge</span>
              <span className="text-[11px] text-slate-400">
                Status:{' '}
                <strong
                  className={`font-mono uppercase ${
                    verificationStatus === 'VERIFIED'
                      ? 'text-emerald-400'
                      : verificationStatus === 'PENDING'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {verificationStatus}
                </strong>
              </span>
            </div>
          </div>

          {verificationStatus === 'VERIFIED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/[0.06]">
            <div>
              <span className="text-xs font-bold text-white block">List in Public Directory</span>
              <span className="text-[11px] text-slate-400">
                Allow verified guardians to discover your profile
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">University / College</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of Dhaka"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Department & Batch</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Physics '20"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="3"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Expected Rate Range</label>
              <input
                type="text"
                value={expectedRateRange}
                onChange={(e) => setExpectedRateRange(e.target.value)}
                placeholder="e.g. 8,000 - 12,000 BDT"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Bio / Profile Description</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your teaching approach, past results, and subject expertise..."
              className="w-full p-3 bg-slate-950 border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Subjects Offered (Comma separated)</label>
            <input
              type="text"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Physics, Higher Math, ICT"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Preferred Areas (Comma separated)</label>
            <input
              type="text"
              value={areas}
              onChange={(e) => setAreas(e.target.value)}
              placeholder="Dhanmondi, Mirpur, Mohammadpur"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        {/* Verification Document Upload Sub-section */}
        <div className="mt-8 pt-6 border-t border-white/[0.08]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Submit Document For Verification
          </h4>
          <form onSubmit={handleVerifySubmit} className="flex gap-2">
            <input
              type="url"
              required
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="Document URL (https://...)"
              className="flex-1 h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={submittingDoc || !docUrl.trim()}
              className="h-10 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {submittingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Submit Doc</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

