'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { useAuth } from '@/context/AuthContext';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  X,
  AlertCircle,
  User,
  UserCheck,
  ShieldCheck,
  Lock,
  KeyRound,
  UploadCloud,
  FileText,
  Trash2,
  Info,
  Shield,
  FileCheck,
  Check,
} from 'lucide-react';

export function TeacherProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const profile = user?.teacherProfile;

  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [batchOrYear, setBatchOrYear] = useState(profile?.batchOrYear || '');
  const [experienceYears, setExperienceYears] = useState(
    profile?.experienceYears?.toString() || ''
  );
  const [bio, setBio] = useState(profile?.bio || '');
  const [subjects, setSubjects] = useState(
    profile?.subjectsOffered?.join(', ') || ''
  );
  const [areas, setAreas] = useState(
    profile?.preferredAreas?.join(', ') || ''
  );
  const [expectedRateRange, setExpectedRateRange] = useState(
    profile?.expectedRateRange || ''
  );

  // Verification Document File State (2 separate fields, Max 3 MB each)
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [nidPreview, setNidPreview] = useState<string | null>(null);
  const nidInputRef = React.useRef<HTMLInputElement | null>(null);

  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
  const studentIdInputRef = React.useRef<HTMLInputElement | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'security'>('profile');

  // Revoke object URLs on change/unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (nidPreview) URL.revokeObjectURL(nidPreview);
    };
  }, [nidPreview]);

  React.useEffect(() => {
    return () => {
      if (studentIdPreview) URL.revokeObjectURL(studentIdPreview);
    };
  }, [studentIdPreview]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const areaList = areas.split(',').map((s) => s.trim()).filter(Boolean);

      await api.patch('/teachers/profile', {
        isPublic,
        institution: institution.trim() || undefined,
        department: department.trim() || undefined,
        batchOrYear: batchOrYear.trim() || undefined,
        experienceYears: parseInt(experienceYears, 10) || 0,
        bio: bio.trim() || undefined,
        subjectsOffered: subjectList,
        preferredAreas: areaList,
        expectedRateRange: expectedRateRange.trim() || undefined,
      });

      showSuccessToast('Public profile updated successfully!');
      onClose();
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showErrorToast(null, 'NID / Birth Certificate file exceeds 3 MB limit. Please choose a smaller file.');
      if (nidInputRef.current) nidInputRef.current.value = '';
      return;
    }

    setNidFile(file);
    if (file.type.startsWith('image/')) {
      setNidPreview(URL.createObjectURL(file));
    } else {
      setNidPreview(null);
    }
  };

  const handleRemoveNid = () => {
    if (nidPreview) URL.revokeObjectURL(nidPreview);
    setNidFile(null);
    setNidPreview(null);
    if (nidInputRef.current) nidInputRef.current.value = '';
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showErrorToast(null, 'Student ID card file exceeds 3 MB limit. Please choose a smaller file.');
      if (studentIdInputRef.current) studentIdInputRef.current.value = '';
      return;
    }

    setStudentIdFile(file);
    if (file.type.startsWith('image/')) {
      setStudentIdPreview(URL.createObjectURL(file));
    } else {
      setStudentIdPreview(null);
    }
  };

  const handleRemoveStudentId = () => {
    if (studentIdPreview) URL.revokeObjectURL(studentIdPreview);
    setStudentIdFile(null);
    setStudentIdPreview(null);
    if (studentIdInputRef.current) studentIdInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidFile && !studentIdFile) {
      showErrorToast(null, 'Please select at least one document (NID/Birth Certificate or Student ID, Max 3 MB each).');
      return;
    }
    setSubmittingDocs(true);

    try {
      const docsToSubmit: { url: string; publicId: string; docType: string }[] = [];

      // 1. Upload NID if provided
      if (nidFile) {
        setUploadProgressText('Uploading National ID / Birth Certificate...');
        const nidBase64 = await fileToBase64(nidFile);
        const nidRes = await api.post('/uploads/document', {
          fileData: nidBase64,
          docType: 'National ID (NID)',
        });
        docsToSubmit.push({
          url: nidRes.data.data.url,
          publicId: nidRes.data.data.publicId,
          docType: 'National ID (NID)',
        });
      }

      // 2. Upload Student ID if provided
      if (studentIdFile) {
        setUploadProgressText('Uploading University Student ID Card...');
        const studentIdBase64 = await fileToBase64(studentIdFile);
        const studentIdRes = await api.post('/uploads/document', {
          fileData: studentIdBase64,
          docType: 'University Student ID',
        });
        docsToSubmit.push({
          url: studentIdRes.data.data.url,
          publicId: studentIdRes.data.data.publicId,
          docType: 'University Student ID',
        });
      }

      // 3. Submit documents to verification review
      setUploadProgressText('Submitting credentials for verification...');
      await api.post('/teachers/verification', {
        docs: docsToSubmit,
      });

      showSuccessToast('Documents uploaded & submitted for verification successfully!');
      handleRemoveNid();
      handleRemoveStudentId();
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-tuitions'] });
    } catch (err: unknown) {
      showErrorToast(err, 'Failed to upload and submit documents. Please try again.');
    } finally {
      setSubmittingDocs(false);
      setUploadProgressText('');
    }
  };

  const verificationStatus = profile?.verificationStatus || 'UNSUBMITTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      {/* Self-contained dialog box with internal scroll strictly on the box */}
      <div className="w-full max-w-2xl sm:max-w-3xl bg-slate-900 border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-fadeIn">
        {/* Fixed Modal Header */}
        <div className="p-5 pb-0 border-b border-white/[0.08] shrink-0 bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Profile & Account Settings</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your tutor profile, submit verification credentials, and configure password security.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'profile'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Tutor Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'verification'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Verification</span>
              {verificationStatus === 'VERIFIED' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === 'security'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Security & Password</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body - SCROLL HAPPENS DIRECTLY ON THE BOX */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
          {/* TAB 1: TUTOR PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                <div>
                  <span className="text-xs font-bold text-white block">List in Public Directory</span>
                  <span className="text-[11px] text-slate-400">
                    Allow verified guardians to discover your tutor profile in search
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">University / College</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University of Dhaka"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Department & Batch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Physics '20"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="3"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Expected Rate Range</label>
                  <input
                    type="text"
                    value={expectedRateRange}
                    onChange={(e) => setExpectedRateRange(e.target.value)}
                    placeholder="e.g. 8,000 - 12,000 BDT"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Highlight your teaching approach, past student results, and academic background..."
                  className="w-full p-3.5 bg-slate-950 border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Subjects Offered (Comma separated)</label>
                <input
                  type="text"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Physics, Higher Math, ICT"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Preferred Areas (Comma separated)</label>
                <input
                  type="text"
                  value={areas}
                  onChange={(e) => setAreas(e.target.value)}
                  placeholder="Dhanmondi, Mirpur, Mohammadpur"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.05]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: VERIFICATION & CREDENTIALS */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-white/[0.08] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Tutor Verification Badge</span>
                    <span className="text-[11px] text-slate-400">
                      Status:{' '}
                      <strong
                        className={`font-mono uppercase ${
                          verificationStatus === 'VERIFIED'
                            ? 'text-emerald-400'
                            : verificationStatus === 'PENDING'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {verificationStatus}
                      </strong>
                    </span>
                  </div>
                </div>

                {verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono whitespace-nowrap shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Verified Tutor</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono whitespace-nowrap shrink-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>Under Review</span>
                  </span>
                )}
              </div>

              {/* Verification Guidelines & Requirements Description */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950/80 to-slate-900/60 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                  <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                    Verification Guidelines & What to Upload
                  </h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  To obtain the <strong>Verified Tutor</strong> badge and earn maximum trust from guardians on the public directory and marketplace, please provide clear, authentic copies of the following two documents:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <Shield className="h-3.5 w-3.5" />
                      <span>1. National ID / Birth Certificate</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      A clear, front-side photo or scan of your government-issued NID or digital Birth Registration Certificate. Your legal name and birthdate must be clearly legible.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>2. University Student ID Card</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Your current university student ID card, library card, or department certificate. Institution name, student name, department, and valid session must be visible.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>Formats:</strong> JPG, PNG, WEBP, or PDF
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <strong>Max Size:</strong> 3 MB per file
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <strong>Strict Privacy:</strong> Only visible to compliance admins
                  </span>
                </div>
              </div>

              {/* TWO SEPARATE DOCUMENT UPLOAD FIELDS */}
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* FIELD 1: National ID / Birth Certificate */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                          <Shield className="h-4 w-4 text-emerald-400" />
                          <span>National ID / Birth Certificate</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {nidFile ? 'Selected' : 'Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Front side of your NID card or digital Birth Certificate.
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={nidInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleNidChange}
                      className="hidden"
                    />

                    {nidFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {nidPreview ? (
                            <img
                              src={nidPreview}
                              alt="NID preview"
                              className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-semibold text-white block truncate">
                              {nidFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              {(nidFile.size / (1024 * 1024)).toFixed(2)} MB â€¢ Ready
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveNid}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => nidInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            nidInputRef.current?.click();
                          }
                        }}
                        className="border-2 border-dashed border-white/[0.1] hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-slate-900/80 group hover:scale-[1.01]"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-emerald-400 mx-auto mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white block">
                          Choose NID / Birth Certificate
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Max 3 MB â€¢ JPG, PNG, WEBP, PDF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* FIELD 2: University / Student ID Card */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-white font-semibold text-xs">
                          <GraduationCap className="h-4 w-4 text-indigo-400" />
                          <span>Student ID Card</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {studentIdFile ? 'Selected' : 'Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        University student ID, admit card, or department certificate.
                      </p>
                    </div>

                    {/* Hidden input */}
                    <input
                      ref={studentIdInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleStudentIdChange}
                      className="hidden"
                    />

                    {studentIdFile ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {studentIdPreview ? (
                            <img
                              src={studentIdPreview}
                              alt="Student ID preview"
                              className="h-10 w-10 rounded-lg object-cover border border-white/[0.1] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-semibold text-white block truncate">
                              {studentIdFile.name}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              {(studentIdFile.size / (1024 * 1024)).toFixed(2)} MB â€¢ Ready
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveStudentId}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => studentIdInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            studentIdInputRef.current?.click();
                          }
                        }}
                        className="border-2 border-dashed border-white/[0.1] hover:border-indigo-500/50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-slate-900/80 group hover:scale-[1.01]"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-400 mx-auto mb-1.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white block">
                          Choose Student ID Card
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Max 3 MB â€¢ JPG, PNG, WEBP, PDF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingDocs || (!nidFile && !studentIdFile)}
                    className="w-full h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/15 active:scale-[0.99]"
                  >
                    {submittingDocs ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{uploadProgressText || 'Uploading & Submitting Documents...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Upload & Submit Documents for Verification
                          {nidFile && studentIdFile ? ' (2 Files Selected)' : nidFile || studentIdFile ? ' (1 File Selected)' : ''}
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    ðŸ”’ Documents are encrypted and submitted directly to TutorHub administrative review.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}

