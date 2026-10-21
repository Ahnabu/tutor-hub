'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import {
  GraduationCap,
  CheckCircle2,
  Search,
  MapPin,
  BookOpen,
  ArrowRight,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Briefcase,
} from 'lucide-react';

interface PublicTeacher {
  id: string;
  name: string;
  avatarUrl?: string;
  institution?: string;
  department?: string;
  batchOrYear?: string;
  experienceYears?: number;
  bio?: string;
  subjectsOffered: string[];
  preferredAreas: string[];
  expectedRateRange?: string;
  isVerifiedTutor: boolean;
  slug?: string;
}

const COMMON_SUBJECTS = ['All', 'Physics', 'Math', 'Higher Math', 'Chemistry', 'Biology', 'English', 'ICT'];
const COMMON_AREAS = ['All', 'Dhanmondi', 'Mirpur', 'Gulshan', 'Uttara', 'Bashundhara', 'Mohakhali', 'Mohammadpur'];

export default function TeachersDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');

  // Fetch Public Teacher Directory
  const { data, isLoading } = useQuery<{
    teachers: PublicTeacher[];
    total: number;
  }>({
    queryKey: ['public-teachers-directory', searchTerm, selectedSubject, selectedArea],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedSubject !== 'All') params.subject = selectedSubject;
      if (selectedArea !== 'All') params.area = selectedArea;

      const res = await api.get('/teachers', { params });
      return res.data.data;
    },
  });

  const teachers = data?.teachers || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-24 sm:pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-900/80 to-indigo-500/10 border border-white/[0.08] backdrop-blur-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>VERIFIED BANGLADESH TUTORS DIRECTORY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Find Exceptional Private Tutors
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Browse background-checked mentors from top universities. Transparent rates, privacy-gated contact access, and live progress logging.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1.5 text-xs font-mono">
            <span className="text-emerald-400 font-bold text-2xl">{data?.total ?? teachers.length}</span>
            <span className="text-slate-400">Active Verified Profiles</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl mb-8 space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tutor name, university (e.g. DU, BUET), or subjects..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950/80 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/[0.05]">
            {/* Subjects */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 shrink-0">Subject:</span>
              {COMMON_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-white/[0.05] hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Areas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 shrink-0">Area:</span>
              {COMMON_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer ${
                    selectedArea === area
                      ? 'bg-indigo-500 text-white border-indigo-500 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-white/[0.05] hover:text-white'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading tutors directory...</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-white/[0.06]">
            <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No tutors matched your filters</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Try adjusting your search query, or clear selected subjects and areas.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('All');
                setSelectedArea('All');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-lg hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Tutor Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white">{t.name}</h3>
                          {t.isVerifiedTutor && (
                            <span title="Verified Tutor">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block">
                          {t.institution || 'Verified Tutor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Department & Experience Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-mono">
                    {t.department && (
                      <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-white/[0.06] text-slate-300">
                        {t.department} {t.batchOrYear ? `'${t.batchOrYear.slice(-2)}` : ''}
                      </span>
                    )}
                    {typeof t.experienceYears === 'number' && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                        <Briefcase className="h-3 w-3" />
                        <span>{t.experienceYears}+ yrs exp</span>
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {t.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {t.bio}
                    </p>
                  )}

                  {/* Subjects */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
                      Subjects Offered:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {t.subjectsOffered.slice(0, 4).map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/[0.04] text-slate-300"
                        >
                          {sub}
                        </span>
                      ))}
                      {t.subjectsOffered.length > 4 && (
                        <span className="text-[11px] px-1.5 py-0.5 text-slate-500 font-mono">
                          +{t.subjectsOffered.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preferred Areas */}
                  {t.preferredAreas.length > 0 && (
                    <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{t.preferredAreas.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Footer with Rate and CTA */}
                <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Rate Range</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {t.expectedRateRange || 'Negotiable'}
                    </span>
                  </div>

                  <Link
                    href={`/teachers/${t.slug || t.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer group-hover:bg-emerald-500 group-hover:text-slate-950"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
