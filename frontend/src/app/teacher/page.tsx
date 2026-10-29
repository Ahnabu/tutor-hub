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
  User,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  UploadCloud,
  FileText,
  Trash2,
  Info,
  Shield,
  FileCheck,
  Check,
  Calendar,
  Clock,
  Users,
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
    enabled: !!user,
  });

  // Fetch incoming contact requests
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['teacher-incoming-requests'],
    queryFn: async () => {
      const res = await api.get('/contact-requests/incoming');
      return res.data.data.requests;
    },
    enabled: !!user,
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
              const studentNames = tuition.students.map((s) => s.name).join(' & ') || 'Student';
              const studentClasses = Array.from(new Set(tuition.students.map((s) => s.classGrade))).join(', ');
              const allSubjects = Array.from(
                new Set(tuition.students.flatMap((s) => s.subjects || []))
              );
              const cycle = tuition.currentCycle;
              const target = tuition.scheduleConfig?.targetDaysPerCycle || 12;
              const percent = Math.min(100, Math.round((cycle.completedDays / target) * 100));

              return (
                <div
                  key={tuition._id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Student Name(s) & Payment Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {studentNames}
                          </h3>
                          {tuition.students.length > 1 && (
                            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {tuition.students.length} Students
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {tuition.students.length > 1
                            ? tuition.students.map((s) => `${s.name} (${s.classGrade})`).join(' • ')
                            : `${tuition.students[0]?.classGrade || ''}${tuition.students[0]?.curriculum ? ` • ${tuition.students[0].curriculum}` : ''}`}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
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

                    {/* Subject Tags & Cycle Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                      <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tuition.scheduleConfig?.billingModel === 'FIXED_WEEKLY'
                          ? 'Weekly Cycle'
                          : 'Monthly Cycle'}
                      </span>
                      {tuition.scheduleConfig?.weeklyDays && tuition.scheduleConfig.weeklyDays.length > 0 && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-white/[0.04]">
                          {tuition.scheduleConfig.weeklyDays.join(', ')}
                        </span>
                      )}
                      {allSubjects.map((sub, idx) => (
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
const ALL_WEEK_DAYS = [
  { id: 'SAT', label: 'Sat', full: 'Saturday' },
  { id: 'SUN', label: 'Sun', full: 'Sunday' },
  { id: 'MON', label: 'Mon', full: 'Monday' },
  { id: 'TUE', label: 'Tue', full: 'Tuesday' },
  { id: 'WED', label: 'Wed', full: 'Wednesday' },
  { id: 'THU', label: 'Thu', full: 'Thursday' },
  { id: 'FRI', label: 'Fri', full: 'Friday' },
];

interface StudentFormItem {
  id: string;
  name: string;
  classGrade: string;
  subjects: string;
}

function CreateTuitionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  // Support multiple students (same class or different classes, e.g. siblings/batch)
  const [students, setStudents] = useState<StudentFormItem[]>([
    { id: '1', name: '', classGrade: 'Class 9', subjects: 'Physics, Math' },
  ]);
  const [monthlyFee, setMonthlyFee] = useState('8000');

  // Cycle Model: WEEKLY (choose days) vs MONTHLY (choose number of days per cycle)
  const [cycleType, setCycleType] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [selectedWeeklyDays, setSelectedWeeklyDays] = useState<string[]>(['SUN', 'TUE', 'THU']);
  const [targetDays, setTargetDays] = useState('12');

  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStudent = () => {
    setStudents((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        classGrade: prev[prev.length - 1]?.classGrade || 'Class 9',
        subjects: prev[prev.length - 1]?.subjects || 'General',
      },
    ]);
  };

  const removeStudent = (id: string) => {
    if (students.length <= 1) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStudent = (id: string, field: keyof StudentFormItem, value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const toggleDay = (dayId: string) => {
    setSelectedWeeklyDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

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

    // Validate all students
    for (let i = 0; i < students.length; i++) {
      if (!students[i].name.trim()) {
        const msg = `Please enter student full name for Student #${i + 1}`;
        setError(msg);
        showErrorToast(new Error(msg));
        return;
      }
      if (!students[i].classGrade.trim()) {
        const msg = `Please enter class/grade for ${students[i].name || `Student #${i + 1}`}`;
        setError(msg);
        showErrorToast(new Error(msg));
        return;
      }
    }

    if (cycleType === 'WEEKLY' && selectedWeeklyDays.length === 0) {
      const msg = 'Please choose at least one day for weekly cycle';
      setError(msg);
      showErrorToast(new Error(msg));
      return;
    }

    setLoading(true);

    try {
      const payloadStudents = students.map((s) => {
        const subjectList = s.subjects
          .split(',')
          .map((sub) => sub.trim())
          .filter(Boolean);
        return {
          name: s.name.trim(),
          classGrade: s.classGrade.trim(),
          subjects: subjectList.length > 0 ? subjectList : ['General'],
          isActive: true,
        };
      });

      const isWeekly = cycleType === 'WEEKLY';
      const daysCount = isWeekly
        ? selectedWeeklyDays.length * 4
        : parseInt(targetDays, 10) || 12;

      const uniqueClasses = Array.from(new Set(payloadStudents.map((s) => s.classGrade))).join(', ');
      const autoTitle = `${payloadStudents.map((s) => s.name).join(', ')} — ${uniqueClasses}`;

      await api.post('/tuitions', {
        title: autoTitle,
        students: payloadStudents,
        scheduleConfig: {
          billingModel: isWeekly ? 'FIXED_WEEKLY' : 'MONTHLY_CYCLE',
          targetDaysPerCycle: daysCount,
          weeklyDays: selectedWeeklyDays.length > 0 ? selectedWeeklyDays : ['SUN', 'TUE', 'THU'],
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
      <div className="w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Create Student Agreement</h3>
        <p className="text-xs text-slate-400 mb-5">
          Set up a tuition contract for one or multiple students (same or different classes), cycle schedule, and billing.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Multiple Students Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Students in this Tuition ({students.length})</span>
              </label>
              <button
                type="button"
                onClick={addStudent}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Student</span>
              </button>
            </div>

            <div className="space-y-3">
              {students.map((st, index) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.07] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Student #{index + 1}</span>
                      {students.length > 1 && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Multiple students in 1 contract)
                        </span>
                      )}
                    </span>
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudent(st.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer text-xs flex items-center gap-1"
                        title="Remove student"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={st.name}
                        onChange={(e) => updateStudent(st.id, 'name', e.target.value)}
                        placeholder={`e.g. ${index === 0 ? 'Abrar Fahim' : 'Sadia Fahim'}`}
                        className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Class / Grade * (Can differ)
                      </label>
                      <input
                        type="text"
                        required
                        value={st.classGrade}
                        onChange={(e) => updateStudent(st.id, 'classGrade', e.target.value)}
                        placeholder="e.g. Class 9, HSC, Class 7"
                        className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Subjects (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={st.subjects}
                      onChange={(e) => updateStudent(st.id, 'subjects', e.target.value)}
                      placeholder="e.g. Physics, Higher Math"
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Monthly Fee (Total BDT) *</label>
            <input
              type="number"
              required
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="8000"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cycle Type Selector (Weekly vs Monthly) */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cycle Schedule Type *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-white/[0.08] rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setCycleType('WEEKLY')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  cycleType === 'WEEKLY'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Weekly Cycle</span>
              </button>
              <button
                type="button"
                onClick={() => setCycleType('MONTHLY')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  cycleType === 'MONTHLY'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Monthly Cycle</span>
              </button>
            </div>

            {/* Respective Option Display */}
            {cycleType === 'WEEKLY' ? (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">
                    Choose Class Days (Weekly):
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {selectedWeeklyDays.length} days/week ({selectedWeeklyDays.length * 4} classes/cycle)
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {ALL_WEEK_DAYS.map((day) => {
                    const isSelected = selectedWeeklyDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.15]'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  Selected: {selectedWeeklyDays.length > 0 ? selectedWeeklyDays.join(', ') : 'None'}. Cycle completes every {selectedWeeklyDays.length * 4} classes.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium">
                    Monthly Days / Classes Per Cycle *
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {targetDays} days / month
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['8', '10', '12', '16', '20', '24'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTargetDays(d)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                          targetDays === d
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tuition billing cycle auto-completes and renews every {targetDays || 12} logged classes.
                </p>
              </div>
            )}
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
  const studentNames = tuition.students.map((s) => s.name).join(' & ') || 'Student';

  // Attendance map for all students in this tuition: { [studentId]: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>(() => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    tuition.students.forEach((s) => {
      if (s._id) initial[s._id] = 'PRESENT';
    });
    return initial;
  });

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
      // Build session entries for all students in this contract
      const sessionEntries = tuition.students.map((st) => ({
        studentId: st._id || tuition.students[0]._id,
        attendance: attendanceMap[st._id!] || 'PRESENT',
        subject: st.subjects?.[0] || 'General',
        topicsTaught: topicsTaught.trim(),
        unfinishedTopics: unfinishedTopics.trim() || undefined,
        homeworkAssigned: homeworkAssigned.trim() || undefined,
        previousHomeworkStatus: homeworkStatus,
      }));

      await api.post(`/tuitions/${tuition._id}/sessions`, {
        clientRequestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sessionDate: new Date(date).toISOString(),
        sessionLocalDate: date,
        durationMinutes: parseInt(duration, 10) || 90,
        sessionType: 'REGULAR',
        entries: sessionEntries,
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
        <h3 className="text-xl font-bold text-white mb-1">Log Daily Session: {studentNames}</h3>

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

          {/* Multiple Students Attendance Selector */}
          {tuition.students.length > 1 && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span>Student Attendance ({tuition.students.length} Students):</span>
                </label>
                <span className="text-[10px] text-slate-400">P = Present, A = Absent, L = Late</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tuition.students.map((st) => {
                  const currentStatus = attendanceMap[st._id!] || 'PRESENT';
                  return (
                    <div
                      key={st._id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-white/[0.05]"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate">{st.name}</p>
                        <p className="text-[10px] text-slate-400">{st.classGrade}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [st._id!]: status }))}
                            className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                              currentStatus === status
                                ? status === 'PRESENT'
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : status === 'ABSENT'
                                  ? 'bg-rose-500 text-white font-bold'
                                  : 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Late'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                `Hello! Here is the progress and attendance tracking link for ${tuition.students.map((s) => s.name).join(' & ')}: ${fullUrl}\nAccess PIN: ${pin}`
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

  // Verification Document File State (2 separate fields, Max 3 MB each)
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const nidInputRef = React.useRef<HTMLInputElement | null>(null);

  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
  const studentIdInputRef = React.useRef<HTMLInputElement | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'security'>('profile');

  // Security & Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

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

  const handleNidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showErrorToast(null, 'NID / Birth Certificate file exceeds 3 MB limit. Please choose a smaller file.');
      if (nidInputRef.current) nidInputRef.current.value = '';
      return;
    }

    setNidFile(file);
    if (file.type.startsWith('image/')) {
      setNidPreview(URL.createObjectURL(file));
    } else {
      setNidPreview(null);
    }
  };

  const handleRemoveNid = () => {
    if (nidPreview) URL.revokeObjectURL(nidPreview);
    setNidFile(null);
    setNidPreview(null);
    if (nidInputRef.current) nidInputRef.current.value = '';
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showErrorToast(null, 'Student ID card file exceeds 3 MB limit. Please choose a smaller file.');
      if (studentIdInputRef.current) studentIdInputRef.current.value = '';
      return;
    }

    setStudentIdFile(file);
    if (file.type.startsWith('image/')) {
      setStudentIdPreview(URL.createObjectURL(file));
    } else {
      setStudentIdPreview(null);
    }
  };

  const handleRemoveStudentId = () => {
    if (studentIdPreview) URL.revokeObjectURL(studentIdPreview);
    setStudentIdFile(null);
    setStudentIdPreview(null);
    if (studentIdInputRef.current) studentIdInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidFile && !studentIdFile) {
      showErrorToast(null, 'Please select at least one document (NID/Birth Certificate or Student ID, Max 3 MB each).');
      return;
    }
    setSubmittingDocs(true);

    try {
      const docsToSubmit: { url: string; publicId: string; docType: string }[] = [];

      // 1. Upload NID if provided
      if (nidFile) {
        setUploadProgressText('Uploading National ID / Birth Certificate...');
        const nidBase64 = await fileToBase64(nidFile);
        const nidRes = await api.post('/uploads/document', {
          fileData: nidBase64,
          docType: 'National ID (NID)',
        });
        docsToSubmit.push({
          url: nidRes.data.data.url,
          publicId: nidRes.data.data.publicId,
          docType: 'National ID (NID)',
        });
      }

      // 2. Upload Student ID if provided
      if (studentIdFile) {
        setUploadProgressText('Uploading University Student ID Card...');
        const studentIdBase64 = await fileToBase64(studentIdFile);
        const studentIdRes = await api.post('/uploads/document', {
          fileData: studentIdBase64,
          docType: 'University Student ID',
        });
        docsToSubmit.push({
          url: studentIdRes.data.data.url,
          publicId: studentIdRes.data.data.publicId,
          docType: 'University Student ID',
        });
      }

      // 3. Submit documents to verification review
      setUploadProgressText('Submitting credentials for verification...');
      await api.post('/teachers/verification', {
        docs: docsToSubmit,
      });

      showSuccessToast('Documents uploaded & submitted for verification successfully!');
      handleRemoveNid();
      handleRemoveStudentId();
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-tuitions'] });
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to upload and submit documents. Please try again.');
    } finally {
      setSubmittingDocs(false);
      setUploadProgressText('');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showErrorToast(null, 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast(null, 'New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      showSuccessToast('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await api.post('/auth/logout-all');
      showSuccessToast('Signed out of all other devices successfully.');
    } catch (err: unknown) {
      showErrorToast(err, 'Could not sign out of other devices.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  const verificationStatus = profile?.verificationStatus || 'UNSUBMITTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      {/* Self-contained dialog box with internal scroll strictly on the box */}
      <div className="w-full max-w-2xl sm:max-w-3xl bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-fadeIn">
        {/* Fixed Modal Header */}
        <div className="p-5 pb-0 border-b border-white/[0.08] shrink-0 bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Profile & Account Settings</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your tutor profile, submit verification credentials, and configure password security.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'profile'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Tutor Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'verification'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Verification</span>
              {verificationStatus === 'VERIFIED' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'security'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Security & Password</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body - SCROLL HAPPENS DIRECTLY ON THE BOX */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
          {/* TAB 1: TUTOR PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <div>
                  <span className="text-xs font-bold text-white block">List in Public Directory</span>
                  <span className="text-[11px] text-slate-400">
                    Allow verified guardians to discover your tutor profile in search
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">University / College</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University of Dhaka"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Department & Batch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Physics '20"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="3"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Expected Rate Range</label>
                  <input
                    type="text"
                    value={expectedRateRange}
                    onChange={(e) => setExpectedRateRange(e.target.value)}
                    placeholder="e.g. 8,000 - 12,000 BDT"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Highlight your teaching approach, past student results, and academic background..."
                  className="w-full p-3.5 bg-slate-950 border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Subjects Offered (Comma separated)</label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Physics, Higher Math, ICT"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Preferred Areas (Comma separated)</label>
                <input
                  type="text"
                  value={areas}
                  onChange={(e) => setAreas(e.target.value)}
                  placeholder="Dhanmondi, Mirpur, Mohammadpur"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
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
          )}

          {/* TAB 2: VERIFICATION & CREDENTIALS */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-white/[0.08] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Tutor Verification Badge</span>
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

                {verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono whitespace-nowrap shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Verified Tutor</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono whitespace-nowrap shrink-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>Under Review</span>
                  </span>
                )}
              </div>

              {/* Verification Guidelines & Requirements Description */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950/80 to-slate-900/60 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                  <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                    Verification Guidelines & What to Upload
                  </h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  To obtain the <strong>Verified Tutor</strong> badge and earn maximum trust from guardians on the public directory and marketplace, please provide clear, authentic copies of the following two documents:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <Shield className="h-3.5 w-3.5" />
                      <span>1. National ID / Birth Certificate</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      A clear, front-side photo or scan of your government-issued NID or digital Birth Registration Certificate. Your legal name and birthdate must be clearly legible.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>2. University Student ID Card</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Your current university student ID card, library card, or department certificate. Institution name, student name, department, and valid session must be visible.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>Formats:</strong> JPG, PNG, WEBP, or PDF
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <strong>Max Size:</strong> 3 MB per file
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <strong>Strict Privacy:</strong> Only visible to compliance admins
                  </span>
                </div>
              </div>

              {/* TWO SEPARATE DOCUMENT UPLOAD FIELDS */}
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* FIELD 1: National ID / Birth Certificate */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                          <Shield className="h-4 w-4 text-emerald-400" />
                          <span>National ID / Birth Certificate</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {nidFile ? 'Selected' : 'Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Front side of your NID card or digital Birth Certificate.
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={nidInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleNidChange}
                      className="hidden"
                    />

                    {nidFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {nidPreview ? (
                            <img
                              src={nidPreview}
                              alt="NID preview"
                              className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-semibold text-white block truncate">
                              {nidFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              {(nidFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveNid}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => nidInputRef.current?.click()}
                        className="border-2 border-dashed border-white/[0.1] hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-slate-900/80 group hover:scale-[1.01]"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-emerald-400 mx-auto mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white block">
                          Choose NID / Birth Certificate
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Max 3 MB • JPG, PNG, WEBP, PDF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* FIELD 2: University / Student ID Card */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                          <GraduationCap className="h-4 w-4 text-indigo-400" />
                          <span>Student ID Card</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {studentIdFile ? 'Selected' : 'Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        University student ID, admit card, or department certificate.
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={studentIdInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleStudentIdChange}
                      className="hidden"
                    />

                    {studentIdFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {studentIdPreview ? (
                            <img
                              src={studentIdPreview}
                              alt="Student ID preview"
                              className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-semibold text-white block truncate">
                              {studentIdFile.name}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              {(studentIdFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveStudentId}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => studentIdInputRef.current?.click()}
                        className="border-2 border-dashed border-white/[0.1] hover:border-indigo-500/50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-slate-900/80 group hover:scale-[1.01]"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-400 mx-auto mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white block">
                          Choose Student ID Card
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Max 3 MB • JPG, PNG, WEBP, PDF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingDocs || (!nidFile && !studentIdFile)}
                    className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/15 active:scale-[0.99]"
                  >
                    {submittingDocs ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{uploadProgressText || 'Uploading & Submitting Documents...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Upload & Submit Documents for Verification
                          {nidFile && studentIdFile ? ' (2 Files Selected)' : nidFile || studentIdFile ? ' (1 File Selected)' : ''}
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    🔒 Documents are encrypted and submitted directly to TutorHub administrative review.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Change Account Password</h4>
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
                        placeholder="Enter your current password"
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
                        placeholder="Enter a secure new password"
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
                        placeholder="Repeat your new password"
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
                    className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    <span>Update Account Password</span>
                  </button>
                </form>
              </div>

              {/* Session Management Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white">Device Sessions</h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Lost your phone or logged in on a public computer? Revoke all other active sessions across devices immediately.
                </p>

                <button
                  type="button"
                  onClick={handleLogoutAll}
                  disabled={loggingOutAll}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-2 border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loggingOutAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>Sign Out of All Other Devices</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

