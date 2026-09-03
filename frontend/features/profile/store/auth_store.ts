/**
 * auth_store — Compatibility shim over the unified NammaDharaniStore.
 *
 * Existing consumers (Profile.tsx, profile_modal.tsx, login_modal.tsx)
 * import from here. New features should import from @/shared/store directly.
 */

import { useStore } from '@/shared/store';
import type { UserProfile } from '@/shared/types';

// Legacy User shape used by older components
export interface User {
  name: string;
  email: string;
  avatar?: string;
}

// Re-export UserProfile for the rest of the profile feature
export type { UserProfile };

/**
 * Drop-in replacement for the old Zustand selector hook.
 * Adapts the unified store's auth slice to the old API shape.
 */
export function useAuthStore<T>(
  selector: (state: {
    isLoggedIn: boolean;
    user: User | null;
    userProfile: UserProfile | null;
    login: (user: User) => void;
    logout: () => Promise<void>;
  }) => T,
): T {
  return useStore((s) =>
    selector({
      isLoggedIn: s.auth.isAuthenticated,
      user: s.auth.user
        ? {
            name: s.auth.user.name,
            email: s.auth.user.email,
            avatar: s.auth.user.avatarUrl ?? undefined,
          }
        : null,
      userProfile: s.auth.user,
      login: (u: User) =>
        s.loginSuccess(
          {
            id: '',
            name: u.name,
            username: u.name,
            email: u.email,
            phone: '',
            role: 'buyer',
            isVerified: false,
            isPro: false,
            avatarUrl: u.avatar ?? null,
          },
          '',
        ),
      logout: s.logout,
    }),
  );
}
