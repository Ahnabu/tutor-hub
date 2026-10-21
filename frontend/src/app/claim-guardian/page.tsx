'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { Navbar } from '@/components/Navbar';
import { OtpInput } from '@/components/OtpInput';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, Mail, Eye, EyeOff } from 'lucide-react';

function ClaimGuardianContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { login } = useAuth();

  const [step, setStep] = useState<'START' | 'VERIFY'>('START');
  const [emailHint, setEmailHint] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/claim-guardian/start', {
        claimToken: token,
      });

      setEmailHint(res.data.data.email);
      setStep('VERIFY');
      showSuccessToast('Verification code sent to your email.');
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Invalid or expired claim invitation link.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/claim-guardian/verify', {
        claimToken: token,
        otp: otp.trim(),
        password,
      });

      showSuccessToast('Guardian account activated! Welcome to TutorHub.');
      login(res.data.data.user);
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Verification failed. Please check the code and try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Missing Invitation Token</h2>
        <p className="text-sm text-slate-400 mb-6">
          Please open this page using the invitation link sent by your tutor.
        </p>
        <Link
          href="/"
          className="inline-block text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-all"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Guardian Portal Claim</h1>
        <p className="text-sm text-slate-400 mt-1">
          Activate your account to view live student tuition logs
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'START' ? (
        <div className="text-center space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            Your tutor has created a student profile linked to your contact. To securely activate
            your guardian portal, click below to receive a 6-digit confirmation code.
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Send Verification Code</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            A 6-digit code has been sent to <strong>{emailHint}</strong>.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
              6-Digit Verification Code
            </label>
            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              disabled={loading}
              hasError={!!error}
              autoFocus={true}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Set Your Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/50 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full mt-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activating Portal...</span>
              </>
            ) : (
              <>
                <span>Activate Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ClaimGuardianPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
          <ClaimGuardianContent />
        </Suspense>
      </main>
    </div>
  );
}
