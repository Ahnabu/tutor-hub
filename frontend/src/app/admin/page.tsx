'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  FileCheck,
  ShieldCheck,
  Sliders,
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  Activity,
  Lock,
} from 'lucide-react';

interface IAdminStats {
  totalUsers: number;
  totalTeachers: number;
  verifiedTeachers: number;
  pendingVerifications: number;
  totalGuardians: number;
  totalTuitions: number;
  activeTuitions: number;
  totalSessions: number;
  openMarketplacePosts: number;
}

interface IPendingVerification {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered?: string[];
  verificationStatus: string;
  verificationDocs: Array<{
    url: string;
    docType: string;
    uploadedAt: string;
  }>;
  createdAt: string;
}

interface ITuitionAudit {
  id: string;
  title: string;
  status: string;
  students: Array<{ name: string; classGrade: string }>;
  billingModel?: string;
  agreedFee?: number;
  monthlyTargetDays?: number;
  currentCycle?: {
    cycleNumber?: number;
    completedDays?: number;
    paymentStatus?: string;
  };
  teacher?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  guardian?: {
    name?: string;
    phone?: string;
    label?: string;
  };
  createdAt: string;
}

interface ISystemConfig {
  maintenanceMode: boolean;
  requireAdminApprovalForPosts: boolean;
  forceManualApproval: boolean;
  contactRequestDailyLimit: number;
}

interface IAuditLogItem {
  id: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor?: {
    name?: string;
    email?: string;
  };
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'TUITIONS' | 'CONFIG' | 'LOGS'>(
    'VERIFICATIONS'
  );

  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [verifications, setVerifications] = useState<IPendingVerification[]>([]);
  const [tuitions, setTuitions] = useState<ITuitionAudit[]>([]);
  const [config, setConfig] = useState<ISystemConfig | null>(null);
  const [logs, setLogs] = useState<IAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingTeacherId, setRejectingTeacherId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, verifRes, configRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/verifications'),
        api.get('/admin/config'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data.stats);
      if (verifRes.data?.success) setVerifications(verifRes.data.data.verifications);
      if (configRes.data?.success) setConfig(configRes.data.data.config);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Access forbidden: Administrator privileges required.');
      } else {
        toast.error('Could not load administrative data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTuitionAudits = useCallback(async () => {
    try {
      const res = await api.get('/admin/tuitions');
      if (res.data?.success) setTuitions(res.data.data.tuitions);
    } catch {
      toast.error('Could not load tuition audits.');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success) setLogs(res.data.data.logs);
    } catch {
      toast.error('Could not load audit logs.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes('ADMIN')) {
      fetchAdminData();
    }
  }, [isAuthenticated, user, fetchAdminData]);

  useEffect(() => {
    if (activeTab === 'TUITIONS' && tuitions.length === 0) fetchTuitionAudits();
    if (activeTab === 'LOGS' && logs.length === 0) fetchLogs();
  }, [activeTab, tuitions.length, logs.length, fetchTuitionAudits, fetchLogs]);

  const handleReviewVerification = async (teacherId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setProcessingAction(true);
      const res = await api.post(`/admin/verifications/${teacherId}/review`, {
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason.trim() : undefined,
      });

      if (res.data?.success) {
        toast.success(
          action === 'APPROVE'
            ? 'Teacher profile successfully verified!'
            : 'Teacher verification rejected.'
        );
        setRejectingTeacherId(null);
        setRejectionReason('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Action failed.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!config) return;
    try {
      const res = await api.patch('/admin/config', {
        maintenanceMode: !config.maintenanceMode,
      });
      if (res.data?.success) {
        setConfig(res.data.data.config);
        toast.success(
          `Maintenance mode ${!config.maintenanceMode ? 'ENABLED' : 'DISABLED'}`
        );
      }
    } catch {
      toast.error('Could not update maintenance mode.');
    }
  };

  const handleUpdateLimit = async (limit: number) => {
    try {
      const res = await api.patch('/admin/config', {
        contactRequestDailyLimit: limit,
      });
      if (res.data?.success) {
        setConfig(res.data.data.config);
        toast.success('Contact daily limit updated.');
      }
    } catch {
      toast.error('Could not update contact limit.');
    }
  };

  if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/[0.08] max-w-md w-full">
            <Lock className="h-10 w-10 text-rose-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
            <p className="text-sm text-slate-400 mb-4">
              The Admin Command Center requires verified Administrator privileges.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Banner */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-slate-900/60 to-emerald-500/10 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              ADMIN COMMAND CENTER
            </span>
            {config?.maintenanceMode && (
              <span className="text-xs font-mono font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                MAINTENANCE ACTIVE
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Command & Verification Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Super Administrator: {user.name} ({user.email}). High-integrity credential review, tuition audits, and configuration controls.
          </p>
        </div>

        {/* Live Metrics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
                <Users className="h-3.5 w-3.5 text-indigo-400" /> Total Users
              </span>
              <p className="text-2xl font-extrabold text-white font-mono">{stats.totalUsers}</p>
              <span className="text-[11px] text-slate-500">
                {stats.totalTeachers} teachers • {stats.totalGuardians} guardians
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified Tutors
              </span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                {stats.verifiedTeachers}
              </p>
              <span className="text-[11px] text-amber-400">
                {stats.pendingVerifications} pending review
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
                <GraduationCap className="h-3.5 w-3.5 text-teal-400" /> Active Tuitions
              </span>
              <p className="text-2xl font-extrabold text-white font-mono">{stats.activeTuitions}</p>
              <span className="text-[11px] text-slate-500">{stats.totalTuitions} total records</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
                <BookOpen className="h-3.5 w-3.5 text-amber-400" /> Marketplace
              </span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {stats.openMarketplacePosts}
              </p>
              <span className="text-[11px] text-slate-500">open tuition posts</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('VERIFICATIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'VERIFICATIONS'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Verification Queue</span>
            {verifications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-mono text-[10px]">
                {verifications.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TUITIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'TUITIONS'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tuition Audits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'CONFIG'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>System Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'LOGS'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Tab 1: Verification Queue */}
        {activeTab === 'VERIFICATIONS' && (
          <div className="space-y-4">
            {verifications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06]">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Queue Clean</h3>
                <p className="text-xs text-slate-400">
                  There are no pending teacher verification submissions at this time.
                </p>
              </div>
            ) : (
              verifications.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          PENDING REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {teacher.institution} • {teacher.department} (Batch {teacher.batchOrYear || 'N/A'})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Phone: {teacher.phone} • Email: {teacher.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={processingAction}
                        onClick={() => handleReviewVerification(teacher.id, 'APPROVE')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve Verification</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingAction}
                        onClick={() => setRejectingTeacherId(teacher.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Bio & Subjects */}
                  {teacher.bio && (
                    <p className="text-xs text-slate-300 italic mb-4 bg-slate-950/40 p-3 rounded-xl border border-white/[0.04]">
                      "{teacher.bio}"
                    </p>
                  )}

                  {/* Verification Docs List */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block mb-2">
                      Submitted Verification Documents:
                    </span>
                    {teacher.verificationDocs.length === 0 ? (
                      <p className="text-xs text-slate-500">No document attachments uploaded.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {teacher.verificationDocs.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{doc.docType} Attachment</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Tuition Audits */}
        {activeTab === 'TUITIONS' && (
          <div className="space-y-4">
            {tuitions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06]">
                <BookOpen className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading tuition inspection records...</p>
              </div>
            ) : (
              tuitions.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{t.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tutor: <span className="text-slate-200">{t.teacher?.name}</span> ({t.teacher?.phone || 'No phone'})
                      • Guardian: <span className="text-slate-200">{t.guardian?.name || t.guardian?.label || 'Parent'}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cycle Progress: {t.currentCycle?.completedDays || 0} / {t.monthlyTargetDays || 12} days
                      • Fee: ৳{t.agreedFee?.toLocaleString() || 0} ({t.currentCycle?.paymentStatus || 'PENDING'})
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">
                    Created {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: System Settings */}
        {activeTab === 'CONFIG' && config && (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/[0.08] max-w-2xl space-y-6">
            <h3 className="text-lg font-bold text-white">Platform System Configuration</h3>

            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
              <div>
                <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400">
                  Suspends student booking and displays a maintenance banner to public visitors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleMaintenance}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.maintenanceMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-white/[0.08] hover:text-white'
                }`}
              >
                {config.maintenanceMode ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>

            {/* Daily Contact Request Limit */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-2">
              <label className="block text-sm font-semibold text-white">
                Daily Direct Contact Limit per Guardian
              </label>
              <p className="text-xs text-slate-400">
                Guards teacher contact information from scraping and spam requests.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {[5, 10, 25, 50].map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => handleUpdateLimit(limit)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                      config.contactRequestDailyLimit === limit
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {limit} req/day
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'LOGS' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06]">
                <Activity className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <p className="text-xs text-slate-400">Loading audit trail records...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-900/40 border border-white/[0.06] text-xs flex items-center justify-between gap-4 font-mono"
                >
                  <div>
                    <span className="font-semibold text-indigo-400">{log.action}</span>
                    <span className="text-slate-400 ml-2">by {log.actor?.name || 'System'}</span>
                  </div>
                  <span className="text-slate-500 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Rejection Reason Modal */}
      {rejectingTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D1322] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Reject Verification</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Specify why the teacher's credentials could not be verified. This note will be sent directly to the teacher.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Student ID scan is blurry or name does not match national records..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 mb-4"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingTeacherId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingAction || !rejectionReason.trim()}
                onClick={() => handleReviewVerification(rejectingTeacherId, 'REJECT')}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-all disabled:opacity-50"
              >
                {processingAction ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
