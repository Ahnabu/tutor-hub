'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Plus, ShoppingBag, User, GraduationCap, Compass } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const roleHome = isAuthenticated
    ? user?.roles.includes('TEACHER')
      ? '/teacher'
      : user?.roles.includes('ADMIN')
      ? '/admin'
      : '/guardian'
    : '/';

  const secondTabHref = isAuthenticated
    ? user?.roles.includes('TEACHER')
      ? '/teacher'
      : user?.roles.includes('GUARDIAN')
      ? '/guardian'
      : '/admin'
    : '/teachers';

  const secondTabLabel = isAuthenticated
    ? user?.roles.includes('TEACHER')
      ? 'Tuitions'
      : user?.roles.includes('GUARDIAN')
      ? 'My Kids'
      : 'Overview'
    : 'Tutors';

  return (
    <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-3 inset-x-3 z-50">
      <div className="bg-[#090D16]/95 border border-white/[0.1] backdrop-blur-2xl rounded-2xl p-1.5 px-2 flex items-center justify-around shadow-2xl shadow-black/80">
        {/* Tab 1: Home */}
        <Link
          href={roleHome}
          className={`flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-medium transition-colors ${
            pathname === roleHome || (roleHome === '/' && pathname === '/')
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Tab 2: Dashboard or Directory */}
        <Link
          href={secondTabHref}
          className={`flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith(secondTabHref) && pathname !== '/'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAuthenticated ? <Calendar className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
          <span className="text-[10px]">{secondTabLabel}</span>
        </Link>

        {/* Center Quick Action Button */}
        <Link
          href={isAuthenticated ? (user?.roles.includes('GUARDIAN') ? '/marketplace/create' : '/teachers') : '/teachers'}
          className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center -translate-y-2 shadow-lg shadow-emerald-500/30 border-2 border-[#090D16] active:scale-95 transition-transform"
          aria-label={isAuthenticated ? 'Create Action' : 'Browse Directory'}
        >
          {isAuthenticated && user?.roles.includes('GUARDIAN') ? (
            <Plus className="h-6 w-6 stroke-[2.5]" />
          ) : (
            <Compass className="h-5 w-5 stroke-[2.5]" />
          )}
        </Link>

        {/* Tab 3: Marketplace Tuition Board */}
        <Link
          href="/marketplace"
          className={`flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/marketplace') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px]">Board</span>
        </Link>

        {/* Tab 4: Profile (Accounts, Settings, Auth, and Logout) */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 p-2 min-h-[44px] min-w-[44px] rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/profile') ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
