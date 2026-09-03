'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/shared/store';
import { getProfile } from '@/features/profile/api/auth_api';
import { clearClientAuthData } from '@/shared/services/auth_session.service';
import { cn } from '@/lib/utils';

const SELLER_ROLES = ['seller', 'agent', 'admin'];

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/listings', label: 'My Listings' },
  { href: '/dashboard/enquiries', label: 'Enquiries' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const loginSuccess = useStore((s) => s.loginSuccess);
  const setAuth = useStore((s) => s.setAuth);
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (cancelled) return;
        if (!SELLER_ROLES.includes(profile.role)) {
          router.replace('/');
          return;
        }
        loginSuccess(profile, '');
        setAllowed(true);
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

  if (!allowed) return null;

  return (
    <div className="paper relative min-h-screen bg-parchment">
      <header className="sticky top-0 z-20 border-b border-hairline-strong bg-parchment/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="display text-lg text-ink">Namma Dharani</span>
            <span className="label hidden sm:inline">Seller Register</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-[120ms]',
                    active
                      ? 'border-b-2 border-vermilion text-ink'
                      : 'border-b-2 border-transparent text-ink-muted hover:text-ink',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative px-6 py-10">{children}</main>
    </div>
  );
}
