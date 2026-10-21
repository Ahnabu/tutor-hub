'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
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
  const [daysPerWeek, setDaysPerWeek] = useState(3);
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
      const res = await api.post('/marketplace/posts', {
        title: title.trim(),
        description: description.trim(),
        classGrade: classGrade.trim(),
        curriculum: curriculum.trim(),
        subjects,
        area: area.trim(),
        city: 'Dhaka',
        mode,
        daysPerWeek: Number(daysPerWeek),
        budgetAmount: Number(budgetAmount),
        genderPreference,
      });

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
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tuition Board</span>
        </Link>

        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GUARDIAN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Post Tuition Requirement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-8 leading-relaxed">
            Describe your student&apos;s academic needs to receive direct applications from verified university tutors across Bangladesh.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Post Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Posting Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Class 9 Higher Math & Physics Tutor in Dhanmondi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18]"
              />
            </div>

            {/* Class Grade & Curriculum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Class / Grade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8, Class 9, HSC 1st Year"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Curriculum / Medium
                </label>
                <div className="relative">
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-white/[0.18]"
                  >
                    <option value="Bangla Medium" className="bg-[#0D1322] text-white py-2">
                      Bangla Medium (NCTB)
                    </option>
                    <option value="English Version" className="bg-[#0D1322] text-white py-2">
                      English Version (NCTB)
                    </option>
                    <option value="English Medium (Edexcel)" className="bg-[#0D1322] text-white py-2">
                      English Medium (Edexcel)
                    </option>
                    <option value="English Medium (Cambridge)" className="bg-[#0D1322] text-white py-2">
                      English Medium (Cambridge)
                    </option>
                    <option value="Madrasah" className="bg-[#0D1322] text-white py-2">
                      Madrasah
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Subjects (Comma-separated) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics, Higher Math, General Science"
                value={subjectsInput}
                onChange={(e) => setSubjectsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18]"
              />
            </div>

            {/* Area (Free text in English) & Teaching Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Area / Location (Type in English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi, Mirpur 10, Uttara Sector 4, Bashundhara..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Teaching Mode
                </label>
                <div className="relative">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-white/[0.18]"
                  >
                    <option value="IN_PERSON" className="bg-[#0D1322] text-white py-2">
                      In-Person (Home Tutoring)
                    </option>
                    <option value="ONLINE" className="bg-[#0D1322] text-white py-2">
                      Online Tutoring
                    </option>
                    <option value="HYBRID" className="bg-[#0D1322] text-white py-2">
                      Hybrid (Flexible)
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Days per week & Monthly Budget & Teacher Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Days Per Week
                </label>
                <div className="relative">
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-white/[0.18]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <option key={d} value={d} className="bg-[#0D1322] text-white py-2">
                        {d} days / week
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Monthly Budget (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Teacher Gender
                </label>
                <div className="relative">
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value as any)}
                    className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer transition-colors hover:border-white/[0.18]"
                  >
                    <option value="ANY" className="bg-[#0D1322] text-white py-2">
                      Any Gender
                    </option>
                    <option value="FEMALE" className="bg-[#0D1322] text-white py-2">
                      Female Only
                    </option>
                    <option value="MALE" className="bg-[#0D1322] text-white py-2">
                      Male Only
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Description / Special Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Detailed Requirements & Expectations *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Mention specific topics needed, preferred universities (e.g. BUET, DU, DMC), schedule time slots, or special student needs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950/70 border border-white/[0.1] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors hover:border-white/[0.18] leading-relaxed"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                href="/marketplace"
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{submitting ? 'Publishing...' : 'Publish Tuition Posting'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
