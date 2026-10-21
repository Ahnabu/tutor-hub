'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Plus, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const roleHome = user?.roles.includes('TEACHER')
    ? '/teacher'
    : user?.roles.includes('ADMIN')
    ? '/admin'
    : '/guardian';

  return (
    <nav className="sm:hidden fixed bottom-4 inset-x-4 z-50">
      <div className="bg-[#090D16]/90 border border-white/[0.1] backdrop-blur-2xl rounded-2xl p-2 px-3 flex items-center justify-between shadow-2xl shadow-black/60">
        <Link
          href={roleHome}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
            pathname === roleHome ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          href="/teacher"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/teacher') && pathname !== '/teacher'
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px]">Tuitions</span>
        </Link>

        {/* Center Quick Log (+) Action Button */}
        <button
          type="button"
          onClick={() => {
            alert('Quick Log Session drawer opens here (Phase 2 preview)');
          }}
          className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center -translate-y-3 shadow-lg shadow-emerald-500/30 border-2 border-[#090D16] active:scale-95 transition-transform"
          aria-label="Quick Log Session"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <Link
          href="/marketplace"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/marketplace') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px]">Market</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/profile') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
