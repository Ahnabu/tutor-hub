'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { Navbar } from '@/components/Navbar';
import { OtpInput } from '@/components/OtpInput';
import {
  MailCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Check,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Password change upon verification state
  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const submitVerification = useCallback(
    async (codeToVerify: string) => {
      if (loading || verified || codeToVerify.length !== 6 || !email.trim()) return;

      if (enablePasswordChange) {
        if (newPassword.length < 8) {
          setError('New password must be at least 8 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match. Please re-check.');
          return;
        }
      }

      setError(null);
      setInfoMessage(null);
      setLoading(true);

      try {
        const payload: { email: string; otp: string; newPassword?: string } = {
          email: email.trim().toLowerCase(),
          otp: codeToVerify.trim(),
        };

        if (enablePasswordChange && newPassword) {
          payload.newPassword = newPassword;
        }

        const res = await api.post('/auth/verify-email', payload);

        setVerified(true);
        showSuccessToast(
          enablePasswordChange
            ? 'Email verified and new password set successfully!'
            : 'Email verified successfully! Welcome to TutorHub.'
        );

        setTimeout(() => {
          login(res.data.data.user);
        }, 1000);
      } catch (err: unknown) {
        const msg = showErrorToast(err, 'Verification failed. Please check the code and try again.');
        setError(msg);
        setOtp(''); // Clear single-use OTP on failure
      } finally {
        setLoading(false);
      }
    },
    [email, loading, verified, enablePasswordChange, newPassword, confirmPassword, login]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification(otp);
  };

  const handleAutoSubmit = (completedCode: string) => {
    // Only auto-submit if user hasn't toggled password change or has already filled it
    if (!enablePasswordChange) {
      submitVerification(completedCode);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email.trim() || resending || loading || verified) return;

    setError(null);
    setInfoMessage(null);
    setResending(true);
    setOtp(''); // Reset single-use code input

    try {
      const res = await api.post('/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      });
      const successMsg = res.data?.data?.message || 'A fresh one-time verification code has been sent!';
      setInfoMessage(successMsg);
      showSuccessToast(successMsg);
      setCooldown(60);
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Could not resend code. Please try again.');
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const saveEditedEmail = () => {
    if (tempEmail.trim()) {
      setEmail(tempEmail.trim());
      setEditingEmail(false);
      setOtp('');
      setError(null);
    }
  };

  return (
    <div className="relative w-full max-w-lg max-h-full flex flex-col items-center">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Card with internal scrolling strictly on the box */}
      <div className="relative w-full bg-slate-900/85 border border-white/[0.1] backdrop-blur-2xl rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/70 overflow-y-auto max-h-[calc(100vh-100px)] overscroll-contain">
        {/* Animated Top Header Badge */}
        <div className="text-center mb-6">
          <div className="relative inline-flex mb-3">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15 transition-transform duration-500 hover:scale-105">
              {verified ? (
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-400 animate-bounce" />
              ) : (
                <MailCheck className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-400 animate-[pulse_2.5s_infinite]" />
              )}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {verified ? 'Verification Complete!' : 'Verify your email'}
          </h1>

          {/* Email target chip & edit toggle */}
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            {editingEmail ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-3 py-1 text-xs bg-slate-950 border border-emerald-500/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={saveEditedEmail}
                  className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-slate-950/70 border border-white/[0.08] px-3 py-1 rounded-full text-xs text-slate-300">
                <span>Code sent to:</span>
                <span className="font-semibold text-emerald-400 max-w-[200px] truncate">{email || 'your email'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempEmail(email);
                    setEditingEmail(true);
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
                  title="Change email"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Security & One-Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[11px] font-medium text-emerald-300 mt-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Single-Use Code • Expires in 10 minutes</span>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        {infoMessage && !error && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300">
            <MailCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{infoMessage}</div>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                6-Digit Verification Code
              </label>
              {otp.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOtp('')}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Individual modern digit boxes */}
            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              onComplete={handleAutoSubmit}
              disabled={loading || verified}
              hasError={!!error}
              autoFocus={true}
            />

            <p className="text-[11px] text-slate-500 text-center mt-2">
              💡 Tip: Paste your 6-digit code or type it digit-by-digit
            </p>
          </div>

          {/* Optional Expandable: Password Change upon Verification */}
          <div className="border border-white/[0.08] rounded-2xl bg-slate-950/40 p-3.5 transition-all">
            <button
              type="button"
              onClick={() => {
                setEnablePasswordChange(!enablePasswordChange);
                setError(null);
              }}
              className="w-full flex items-center justify-between text-left text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Set or change password upon verification</span>
              </div>
              {enablePasswordChange ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {enablePasswordChange && (
              <div className="mt-3.5 space-y-3 pt-3 border-t border-white/[0.06] animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    New Password (Min. 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password"
                      className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || verified || otp.length !== 6}
            className={`w-full h-11 sm:h-12 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none
              ${
                verified
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : otp.length === 6 && !loading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 border border-white/[0.05] cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Verifying & Updating...</span>
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-slate-950" />
                <span>Verified! Taking you to TutorHub...</span>
              </>
            ) : (
              <>
                <span>{enablePasswordChange ? 'Verify Code & Save Password' : 'Verify & Unlock Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Forgot Password & Account Recovery Links */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 px-1">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
            <span>Forgot Password?</span>
          </Link>

          <Link
            href="/login"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Back to Login
          </Link>
        </div>

        {/* Resend Cooldown Section */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
          {cooldown > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/50 border border-white/[0.08] text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              <span>
                Resend available in{' '}
                <strong className="text-emerald-400 font-mono font-bold">{cooldown}s</strong>
              </span>
            </div>
          ) : (
            <button
              type="button"
              disabled={resending || loading || verified}
              onClick={handleResend}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 disabled:opacity-50 transition-colors cursor-pointer group"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500 ${
                  resending ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span>
                {resending ? 'Dispatching new code...' : "Didn't receive the email? Request New Code"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#090D16] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-4 relative">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
