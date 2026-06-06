'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useStore } from '@/shared/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Building2, LogOut } from 'lucide-react';
import { getProfile } from '@/features/profile/api/auth_api';
import { clearClientAuthData } from '@/shared/services/auth_session.service';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const user = useStore((s) => s.auth.user);
  const loginSuccess = useStore((s) => s.loginSuccess);
  const setAuth = useStore((s) => s.setAuth);
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile.role !== 'admin') {
          router.replace('/');
          return;
        }
        loginSuccess(profile, '');
        setIsCheckingSession(false);
      })
      .catch(() => {
        if (cancelled) return;
        clearClientAuthData();
        setAuth({ isAuthenticated: false, user: null, token: null });
        router.replace('/');
      });

    return () => {
      cancelled = true;
    };
  }, [loginSuccess, router, setAuth]);

  useEffect(() => {
    if (!isCheckingSession && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/');
    }
  }, [isAuthenticated, isCheckingSession, user, router]);

  if (isCheckingSession || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <nav className="w-56 shrink-0 border-r border-white/10 flex flex-col py-6 px-4 gap-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-4">Admin Panel</p>
        {[
          { href: '/admin', label: 'Overview', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/properties', label: 'Properties', icon: Building2 },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <div className="mt-auto">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <LogOut size={16} />
            Back to App
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
