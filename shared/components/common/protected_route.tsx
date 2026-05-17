'use client';

import { ReactNode, useEffect } from 'react';
import { useStore } from '@/shared/store';
import type { UserRole } from '@/shared/types';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  redirectTo = '/',
  fallback = null,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useStore((s) => s.auth);
  const openLoginModal = useStore((s) => s.openLoginModal);

  const hasRole = !roles || (user && roles.includes(user.role));
  const allowed = isAuthenticated && hasRole;

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
    }
  }, [isAuthenticated, openLoginModal]);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
