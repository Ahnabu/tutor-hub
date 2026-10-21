'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { FileCheck, Sliders, ArrowUpRight, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Header */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-slate-900/60 to-emerald-500/10 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              ADMIN CONTROL PLANE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            TutorHub Administration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as {user?.name || user?.email || 'Administrator'}. Teacher verification queue, marketplace moderation, and system settings.
          </p>
        </div>

        {/* Admin Operational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                2 Pending
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Teacher Verification</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inspect national ID & university credentials via signed authenticated URLs.
            </p>
            <button
              type="button"
              onClick={() => alert('Verification Queue inspection (Phase 4 preview)')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open Verification Queue <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sliders className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Marketplace Moderation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Review new guardian tuition requests and teacher applications.
            </p>
            <button
              type="button"
              onClick={() => alert('Marketplace Moderation (Phase 4 preview)')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Review Posts <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Audit Log
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Audit Trail & Dispute Log</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inspect immutable audit records for contact reveals and admin interventions.
            </p>
            <button
              type="button"
              onClick={() => alert('Audit Viewer (Phase 4 preview)')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View Audit Log <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
