'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  BookOpen,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function CreateTuitionPostPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [curriculum, setCurriculum] = useState('Bangla Medium');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [area, setArea] = useState('Dhanmondi');
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tuition Board</span>
        </Link>

        <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GUARDIAN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Post Tuition Requirement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-8">
            Describe your child's academic requirements to receive applications from verified university tutors.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Posting Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Class 9 Higher Math & Physics Tutor in Dhanmondi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Class Grade & Curriculum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Class / Grade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8, Class 9, HSC 1st Year"
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Curriculum / Medium
                </label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="Bangla Medium">Bangla Medium (NCTB)</option>
                  <option value="English Version">English Version (NCTB)</option>
                  <option value="English Medium (Edexcel)">English Medium (Edexcel)</option>
                  <option value="English Medium (Cambridge)">English Medium (Cambridge)</option>
                  <option value="Madrasah">Madrasah</option>
                </select>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subjects (Comma-separated) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics, Higher Math, General Science"
                value={subjectsInput}
                onChange={(e) => setSubjectsInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Area & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Area in Dhaka *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="Dhanmondi">Dhanmondi</option>
                  <option value="Gulshan">Gulshan</option>
                  <option value="Banani">Banani</option>
                  <option value="Uttara">Uttara</option>
                  <option value="Mirpur">Mirpur</option>
                  <option value="Mohammadpur">Mohammadpur</option>
                  <option value="Badda">Badda</option>
                  <option value="Bashundhara">Bashundhara</option>
                  <option value="Khilgaon">Khilgaon</option>
                  <option value="Malibagh">Malibagh</option>
                  <option value="Old Dhaka">Old Dhaka</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Teaching Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="IN_PERSON">In-Person (Home Tutoring)</option>
                  <option value="ONLINE">Online Tutoring</option>
                  <option value="HYBRID">Hybrid (Flexible)</option>
                </select>
              </div>
            </div>

            {/* Days per week & Monthly Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Days Per Week
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {d} days / week
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Budget (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Teacher Gender
                </label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="ANY">Any Gender</option>
                  <option value="FEMALE">Female Only</option>
                  <option value="MALE">Male Only</option>
                </select>
              </div>
            </div>

            {/* Description / Special Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Requirements & Expectations *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Mention specific topics needed, preferred universities (e.g. BUET, DU, DMC), schedule time slots, or special student needs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                href="/marketplace"
                className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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
