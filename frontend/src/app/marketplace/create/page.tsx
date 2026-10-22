'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export default function CreateTuitionPostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [curriculum, setCurriculum] = useState('Bangla Medium');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [area, setArea] = useState('');
  const [mode, setMode] = useState<'IN_PERSON' | 'ONLINE' | 'HYBRID'>('IN_PERSON');
  const [scheduleType, setScheduleType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [targetDaysPerMonth, setTargetDaysPerMonth] = useState(12);
  const [budgetAmount, setBudgetAmount] = useState(10000);
  const [genderPreference, setGenderPreference] = useState<'ANY' | 'MALE' | 'FEMALE'>('ANY');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in with a guardian account to post tuition requirements.');
      router.push('/login');
      return;
    }

    if (!area.trim()) {
      toast.error('Please enter the area/location.');
      return;
    }

    const subjects = subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) {
      toast.error('Please provide at least one subject (separated by commas).');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        classGrade: classGrade.trim(),
        curriculum: curriculum.trim(),
        subjects,
        area: area.trim(),
        city: 'Dhaka',
        mode,
        budgetAmount: Number(budgetAmount),
        genderPreference,
      };

      if (scheduleType === 'WEEKLY') {
        payload.daysPerWeek = Number(daysPerWeek);
      } else {
        payload.targetDaysPerMonth = Number(targetDaysPerMonth);
      }

      const res = await api.post('/marketplace/posts', payload);

      if (res.data?.success) {
        toast.success('Tuition requirement posted successfully! Tutors can now view and apply.');
        router.push('/marketplace');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Could not post tuition requirement.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-[#F8FAFC] flex flex-col pb-24 sm:pb-16 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tuition Board</span>
        </Link>

        <div className="p-4 sm:p-10 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] backdrop-blur-xl shadow-xl dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              GUARDIAN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Post Tuition Requirement
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 mb-8 leading-relaxed">
            Describe your student&apos;s academic needs to receive direct applications from verified university tutors across Bangladesh.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
            {/* Post Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Posting Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Class 9 Higher Math & Physics Tutor in Dhanmondi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
              />
            </div>

            {/* Class Grade & Curriculum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Class / Grade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8, Class 9, HSC 1st Year"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Curriculum / Medium
                </label>
                <div className="relative">
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                  >
                    <option value="Bangla Medium" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Bangla Medium (NCTB)
                    </option>
                    <option value="English Version" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      English Version (NCTB)
                    </option>
                    <option value="English Medium (Edexcel)" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      English Medium (Edexcel)
                    </option>
                    <option value="English Medium (Cambridge)" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      English Medium (Cambridge)
                    </option>
                    <option value="Madrasah" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Madrasah
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Subjects (Comma-separated) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics, Higher Math, General Science"
                value={subjectsInput}
                onChange={(e) => setSubjectsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
              />
            </div>

            {/* Area (Free text in English) & Teaching Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Area / Location (Type in English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi, Mirpur 10, Uttara Sector 4, Bashundhara..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Teaching Mode
                </label>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                  >
                    <option value="IN_PERSON" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      In-Person (Home Tutoring)
                    </option>
                    <option value="ONLINE" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Online Tutoring
                    </option>
                    <option value="HYBRID" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Hybrid (Flexible)
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Schedule Type & Days & Monthly Budget & Teacher Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Schedule Type *
                </label>
                <div className="relative">
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as 'WEEKLY' | 'MONTHLY')}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                  >
                    <option value="WEEKLY" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Days per week
                    </option>
                    <option value="MONTHLY" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Days per month
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {scheduleType === 'WEEKLY' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Days Per Week *
                  </label>
                  <div className="relative">
                    <select
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                      className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d} className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                          {d} days / week
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Monthly Days / Classes *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    placeholder="e.g. 12 or 16 days/month"
                    value={targetDaysPerMonth}
                    onChange={(e) => setTargetDaysPerMonth(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Monthly Budget (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Teacher Gender Preference
                </label>
                <div className="relative">
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value as any)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-slate-300 dark:hover:border-white/[0.18]"
                  >
                    <option value="ANY" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Any Gender
                    </option>
                    <option value="FEMALE" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Female Only
                    </option>
                    <option value="MALE" className="bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white py-2">
                      Male Only
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Description / Special Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Detailed Requirements & Expectations *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Mention specific topics needed, preferred universities (e.g. BUET, DU, DMC), schedule time slots, or special student needs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-slate-300 dark:hover:border-white/[0.18] leading-relaxed"
              />
            </div>

            {/* Bottom Actions - Responsive and single-line buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <Link
                href="/marketplace"
                className="w-full sm:w-auto text-center px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors whitespace-nowrap"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{submitting ? 'Publishing...' : 'Publish Tuition Posting'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
