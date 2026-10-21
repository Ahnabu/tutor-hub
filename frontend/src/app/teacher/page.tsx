'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900/60 to-indigo-500/10 border border-white/[0.08] backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                TUTOR DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name.split(' ')[0] || 'Teacher'}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Here is your tuition schedule and billing cycle status for today.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('Quick Log Drawer prefilled from last session (Phase 2 preview)')}
            className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Quick Log Session</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Active Tuitions</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">4 Contracts</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> All cycles running
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Sessions</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">2 Scheduled</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Next at 4:30 PM
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Ready to Close</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">1 Cycle</div>
            <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> 12/12 days done
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <span className="text-xs text-slate-400 font-medium">Estimated Dues</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">৳ 24,000</div>
            <div className="text-[11px] text-slate-400 mt-1">BDT Currency</div>
          </div>
        </div>

        {/* Next-Day Memory Preview Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Next-Day Memory Preview</h2>
            </div>
            <span className="text-xs text-slate-400">Prefilled from last logged session</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white">HSC Physics • Ahsan (Class 12)</span>
              <p className="text-xs text-slate-400 mt-1">
                <strong>Last session:</strong> Finished Thermodynamics 1st Law. Left 2 numerical
                problems unfinished.
              </p>
              <p className="text-xs text-amber-400 mt-1">
                <strong>Check today:</strong> Homework Set 3 (Problem 4 & 5).
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Opening prefilled Quick Log for Ahsan')}
              className="self-start sm:self-center text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Start Session Log
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
