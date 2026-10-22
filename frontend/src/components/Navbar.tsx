'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { GraduationCap, LogOut, User, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  // Generate dynamic breadcrumb segments
  const getBreadcrumbs = () => {
    if (!pathname || pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'teachers') label = 'Find Tutors';
      else if (segment === 'marketplace') label = 'Tuition Board';
      else if (segment === 'create') label = 'Post Requirement';
      else if (segment === 'teacher') label = 'Tutor Desk';
      else if (segment === 'guardian') label = 'Guardian Portal';
      else if (segment === 'claim-guardian') label = 'Claim Student';
      else if (segment === 'profile') label = 'Profile';
      else if (segment === 'admin') label = 'Admin Hub';
      else if (segment === 'login') label = 'Log In';
      else if (segment === 'register') label = 'Register';
      else if (segment === 'verify-email') label = 'Verify Email';
      else if (segment === 'reset-password') label = 'Reset Password';
      else if (segment === 'forgot-password') label = 'Forgot Password';
      else if (segment.length > 15) label = 'Details';

      crumbs.push({ label, href: currentPath });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090D16]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Section: Brand & Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 text-slate-950 stroke-[2.2]" />
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-white font-sans inline-block">
              Tutor<span className="text-emerald-400">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/teachers"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                pathname.startsWith('/teachers') ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              <span>Find Tutors</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                Directory
              </span>
            </Link>

            <Link
              href="/marketplace"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                pathname.startsWith('/marketplace') ? 'text-emerald-400' : 'text-slate-300 hover:text-emerald-400'
              }`}
            >
              <span>Tuition Board</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] border border-indigo-500/20">
                Live Feed
              </span>
            </Link>
          </div>

          {/* Dynamic Breadcrumbs (Visible on Desktop for clean, consistent mobile navbar) */}
          {breadcrumbs && (
            <nav
              aria-label="Breadcrumb navigation"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400"
            >
              <span className="text-slate-600">|</span>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />}
                    {isLast ? (
                      <span className="text-slate-200 font-semibold">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Section: Theme Toggle & Profile / Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          {/* MOBILE ONLY: Single Profile Icon Button (Login, Register & Logout are housed in /profile) */}
          <Link
            href="/profile"
            aria-label="Go to Profile and Account Settings"
            className="sm:hidden min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-white/[0.08] hover:border-emerald-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-colors relative"
          >
            {isAuthenticated && user ? (
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <User className="h-5 w-5 text-slate-400" />
            )}
            {isAuthenticated && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#090D16]" />
            )}
          </Link>

          {/* DESKTOP ONLY: Full User Pill & Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition-colors border border-white/[0.08]"
                >
                  <User className="h-4 w-4 text-emerald-400" />
                  <span>{user.name.split(' ')[0]}</span>
                  {user.roles.includes('ADMIN') ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      ADMIN
                    </span>
                  ) : user.roles.includes('TEACHER') ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      TUTOR
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      GUARDIAN
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-lg transition-all shadow-sm shadow-emerald-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
