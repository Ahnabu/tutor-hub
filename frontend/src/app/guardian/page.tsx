'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CheckCircle2 } from 'lucide-react';

export default function GuardianDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-12">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Header */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900/60 to-indigo-500/10 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              GUARDIAN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {user?.name.split(' ')[0] || 'Guardian'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your student&apos;s live tuition attendance, homework completion, and topics covered.
          </p>
        </div>

        {/* Linked Tuition Progress Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                HP
              </div>
              <div>
                <h3 className="text-base font-bold text-white">HSC Physics & Math</h3>
                <span className="text-xs text-slate-400">Teacher: Tanvir Ahmed • Verified Tutor</span>
              </div>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cycle: 10 / 12 Days
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 mb-6 overflow-hidden border border-white/[0.06]">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: '83%' }}
            />
          </div>

          {/* Latest Session Remarks */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Yesterday at 4:30 PM (Present)
              </span>
              <span className="text-slate-500 font-mono">Day 10</span>
            </div>
            <p className="text-slate-300">
              <strong>Topics Taught:</strong> Solved Chapter 4 rotational dynamics exercises. Student
              demonstrated solid grasp of angular momentum.
            </p>
            <p className="text-amber-400">
              <strong>Homework:</strong> Exercises 4.1 to 4.5 due before Saturday.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
