'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  BookOpen,
  Calendar,
  Send,
  PlusCircle,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  X,
} from 'lucide-react';

interface IMarketplacePostItem {
  id: string;
  title: string;
  description: string;
  studentsInfo: Array<{
    classGrade: string;
    curriculum?: string;
    subjects: string[];
  }>;
  location: {
    area: string;
    city: string;
    mode: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  };
  daysPerWeek?: number;
  budgetAmount: number;
  genderPreference?: string;
  status: string;
  createdAt: string;
  applicationCount: number;
  author: {
    name: string;
  };
}

const DHAKA_AREAS = [
  'All Areas',
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohammadpur',
  'Badda',
  'Bashundhara',
];

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<IMarketplacePostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  // Application Modal state
  const [activePost, setActivePost] = useState<IMarketplacePostItem | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedArea !== 'All Areas') params.area = selectedArea;
      if (selectedMode !== 'ALL') params.mode = selectedMode;

      const res = await api.get('/marketplace/posts', { params });
      if (res.data?.success) {
        setPosts(res.data.data.posts || []);
      }
    } catch {
      toast.error('Could not load tuition board. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedArea, selectedMode]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost) return;

    if (!isAuthenticated) {
      toast.error('Please log in with a teacher account to apply.');
      return;
    }

    if (!user?.roles?.includes('TEACHER')) {
      toast.error('Only registered teachers can submit tuition applications.');
      return;
    }

    if (applyMessage.trim().length < 5) {
      toast.error('Please provide a message or pitch of at least 5 characters.');
      return;
    }

    try {
      setApplying(true);
      const res = await api.post(`/marketplace/posts/${activePost.id}/apply`, {
        message: applyMessage.trim(),
      });

      if (res.data?.success) {
        toast.success('Your application was submitted directly to the guardian!');
        setActivePost(null);
        setApplyMessage('');
        fetchPosts();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Could not submit application.';
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col pb-16">
      <Navbar />

      {/* Hero Section */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-indigo-950/20 via-slate-900/40 to-transparent py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>LIVE TUITION BOARD OF BANGLADESH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Verified Tuition Requirements
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Parents post verified tuition requirements across Dhaka and nationwide. Verified tutors connect directly without high agency commission fees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/marketplace/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Tuition Requirement</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Search & Area Filter Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject, class (e.g. Math, Class 9, HSC Physics)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="ALL">All Modes</option>
                <option value="IN_PERSON">In-Person Only</option>
                <option value="ONLINE">Online Only</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Dhaka Area Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DHAKA_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${
                  selectedArea === area
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-medium'
                    : 'bg-slate-900/40 text-slate-400 border-white/[0.06] hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm text-slate-400">Loading tuition postings...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06]">
            <BookOpen className="h-10 w-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Tuition Postings Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              There are currently no active posts matching your search criteria. Try selecting another area or search term.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('All Areas');
                setSelectedMode('ALL');
              }}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const student = post.studentsInfo?.[0];
              return (
                <div
                  key={post.id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5 backdrop-blur-xl"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {student?.classGrade || 'Student'}
                        {student?.curriculum ? ` • ${student.curriculum}` : ''}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {post.description}
                    </p>

                    {/* Subject Badges */}
                    {student?.subjects && student.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {student.subjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/[0.06]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Details List */}
                    <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>
                          {post.location.area}, {post.location.city} ({post.location.mode})
                        </span>
                      </div>
                      {post.daysPerWeek && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{post.daysPerWeek} days / week</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{post.applicationCount} applicant(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Apply Action */}
                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                        Monthly Budget
                      </span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        ৳{post.budgetAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Please log in with a teacher account to apply.');
                          return;
                        }
                        if (!user?.roles?.includes('TEACHER')) {
                          toast.error('Only teachers can apply for tuition posts.');
                          return;
                        }
                        setActivePost(post);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium text-xs border border-indigo-500/30 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Apply as Tutor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Application Pitch Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0D1322] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Apply for Tuition</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs space-y-1">
              <p className="font-semibold text-slate-200">{activePost.title}</p>
              <p className="text-slate-400">
                {activePost.location.area} • ৳{activePost.budgetAmount.toLocaleString()} / mo
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Pitch & Teaching Experience
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Introduce yourself, your university/degree, past experience with this subject, and your teaching style..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
