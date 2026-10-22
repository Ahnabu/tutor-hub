'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  GraduationCap,
  Calendar,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  Mail,
  Phone,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Session & account actions
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password update handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showErrorToast(null, 'New password must be at least 8 characters long.');
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
      showErrorToast(err, 'Failed to update password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Sign out from all other devices
  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await api.post('/auth/logout-all');
      showSuccessToast('Signed out of all other devices successfully.');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to sign out of other devices.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  // Export GDPR data
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await api.get('/auth/export-data');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `tutorhub-data-${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'export'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccessToast('Personal profile data exported successfully!');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to export account data.');
    } finally {
      setExportingData(false);
    }
  };

  // Account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showErrorToast(null, 'Please type DELETE to confirm account removal.');
      return;
    }

    setDeletingAccount(true);
    try {
      await api.post('/auth/delete-account');
      showSuccessToast('Account anonymized and deleted. Goodbye.');
      logout();
      router.push('/');
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  // --------------------------------------------------------------------------
  // GUEST PROFILE VIEW (If user is not logged in on mobile or desktop)
  // --------------------------------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-16">
        <Navbar />

        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex flex-col justify-center">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-2xl text-center space-y-6 shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <User className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to TutorHub Profile
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Log in or create a free account to manage your private tuition schedule, next-day memory logs, or monitor your child&apos;s educational progress.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto w-full pt-2">
              <Link
                href="/login"
                className="w-full h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-white/[0.08] transition-all"
              >
                <LogIn className="h-4 w-4 text-emerald-400" />
                <span>Log In to Account</span>
              </Link>

              <Link
                href="/register"
                className="w-full h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>Get Started Free</span>
              </Link>
            </div>

            <div className="pt-6 border-t border-white/[0.06] text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
              <Link href="/teachers" className="hover:text-emerald-400 transition-colors">
                Browse Tutors Directory
              </Link>
              <span>•</span>
              <Link href="/marketplace" className="hover:text-emerald-400 transition-colors">
                Tuition Board
              </Link>
              <span>•</span>
              <Link href="/claim-guardian" className="hover:text-emerald-400 transition-colors">
                Claim Student Link
              </Link>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED PROFILE VIEW
  // --------------------------------------------------------------------------
  const isTeacher = user.roles.includes('TEACHER');
  const isGuardian = user.roles.includes('GUARDIAN');
  const isAdmin = user.roles.includes('ADMIN');
  const teacherProfile = user.teacherProfile;
  const verificationStatus = teacherProfile?.verificationStatus || 'UNSUBMITTED';

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-16">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900/90 to-indigo-500/10 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl font-black font-sans shadow-lg shadow-emerald-500/20 shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {user.name}
                  </h1>
                  {isTeacher && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      TEACHER
                    </span>
                  )}
                  {isGuardian && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      GUARDIAN
                    </span>
                  )}
                  {isAdmin && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ADMIN
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  {user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>{user.email}</span>
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>{user.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Portal Switcher */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isTeacher && (
                <Link
                  href="/teacher"
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Tuition Desk</span>
                </Link>
              )}
              {isGuardian && (
                <Link
                  href="/guardian"
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Guardian Desk</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Hub</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ROLE-SPECIFIC OVERVIEW SECTION */}
        {isTeacher && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Tutor Profile & Verification</h2>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                  verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : verificationStatus === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border-white/[0.08]'
                }`}
              >
                {verificationStatus === 'VERIFIED'
                  ? '✓ Verified Tutor'
                  : verificationStatus === 'PENDING'
                  ? '⏳ Verification Under Review'
                  : 'Unverified'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-slate-500 block mb-1">University / College</span>
                <span className="font-semibold text-white">{teacherProfile?.institution || 'Not configured'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-slate-500 block mb-1">Department & Batch</span>
                <span className="font-semibold text-white">{teacherProfile?.department || 'Not configured'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.04]">
                <span className="text-slate-500 block mb-1">Public Directory</span>
                <span className="font-semibold text-emerald-400">
                  {teacherProfile?.isPublic ? 'Listed in Search' : 'Hidden from Directory'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                To edit profile details, upload NID or student ID, visit the Tutor Control Plane.
              </span>
              <Link
                href="/teacher"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Edit Credentials</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {isGuardian && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Guardian Tuition Hub</h2>
              </div>
              <Link
                href="/marketplace/create"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>+ Post New Tuition</span>
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              Access your student attendance cycles, review applications to your tuition board postings, and manage verified tutor communication directly in your Guardian Portal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/guardian"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-white/[0.08] transition-colors"
              >
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>View Tuition Contracts</span>
              </Link>
              <Link
                href="/teachers"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-white/[0.08] transition-colors"
              >
                <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Search Verified Tutors</span>
              </Link>
            </div>
          </div>
        )}

        {/* SECURITY & PASSWORD CHANGE SECTION */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Account Security & Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password (Min. 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
            </div>

            <button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {changingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Password</span>
            </button>
          </form>

          {/* Session Management */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-white">Remote Device Sessions</h3>
              <p className="text-[11px] text-slate-400">
                Revoke all active refresh tokens and sign out of TutorHub on all other phones and computers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={loggingOutAll}
              className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-2 border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
            >
              {loggingOutAll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Sign Out All Other Devices</span>
            </button>
          </div>
        </div>

        {/* PRIVACY & DATA SELF-SERVICE */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Data Privacy & Account Controls</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.04] space-y-2">
              <span className="text-xs font-semibold text-white block">Download Your Personal Data</span>
              <p className="text-[11px] text-slate-400">
                Export a complete JSON archive of all your profile information, tuitions, sessions, and marketplace activity.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                disabled={exportingData}
                className="mt-2 h-9 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {exportingData ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>Export Account Data (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-2">
              <span className="text-xs font-semibold text-rose-400 block">Delete Account Permanently</span>
              <p className="text-[11px] text-slate-400">
                Irreversibly anonymize your personal records and revoke all active credentials in accordance with data privacy standards.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-2 h-9 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Account...</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT IN-PROFILE LOGOUT ACTION */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Sign Out of TutorHub</h3>
            <p className="text-xs text-slate-400">
              End your active session on this device. You can log back in anytime with your credentials.
            </p>
          </div>

          {showLogoutConfirm ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  showSuccessToast('Logged out successfully.');
                  router.push('/');
                }}
                className="flex-1 sm:flex-initial h-11 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-white/[0.08] transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </main>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action is permanent and cannot be undone. All personal records will be anonymized, and ongoing active session tokens will be revoked immediately.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] text-xs text-slate-400">
              Please type <strong className="text-rose-400 font-mono">DELETE</strong> in the field below to confirm:
            </div>

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-rose-500/30 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount || deleteConfirmationText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="h-10 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
