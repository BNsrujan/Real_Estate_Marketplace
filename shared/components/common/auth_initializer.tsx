'use client';

import { useEffect, useRef } from 'react';
import { getProfile, getWatchlist } from '@/features/profile/api/auth_api';
import { useStore } from '@/shared/store';
import { hasExplicitLogoutMarker } from '@/shared/services/auth_session.service';
import { applyAppSettings, loadAppSettings } from '@/shared/services/app_settings.service';

export default function AuthInitializer() {
  const loginSuccess = useStore((s) => s.loginSuccess);
  const setWatchlist = useStore((s) => s.setWatchlist);
  const setSettings = useStore((s) => s.setSettings);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const settings = loadAppSettings();
    setSettings(settings);
    applyAppSettings(settings);

    if (hasExplicitLogoutMarker()) return;

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
  }, [loginSuccess, setSettings, setWatchlist]);

  return null;
}
