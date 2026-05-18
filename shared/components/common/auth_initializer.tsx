'use client';

import { useEffect, useRef } from 'react';
import { getProfile, getWatchlist } from '@/features/profile/api/auth_api';
import { useStore } from '@/shared/store';

export default function AuthInitializer() {
  const loginSuccess = useStore((s) => s.loginSuccess);
  const setWatchlist = useStore((s) => s.setWatchlist);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getProfile()
      .then((user) => {
        loginSuccess(user, '');
        return getWatchlist();
      })
      .then((saved) => {
        setWatchlist({ saved });
      })
      .catch(() => {
        // Cookie absent or expired — user stays logged out, no action needed
      });
  }, [loginSuccess, setWatchlist]);

  return null;
}
