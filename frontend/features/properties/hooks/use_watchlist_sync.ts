"use client";

/**
 * useWatchlistSync — Loads and syncs the watchlist with the backend API.
 * Called after login; also wraps save/remove with API calls + optimistic UI.
 */

import { useCallback } from "react";
import { getWatchlist, saveToWatchlist, removeFromWatchlist } from "@/features/profile/api/auth_api";
import { useStore } from "@/shared/store";
import type { Property } from "@/shared/types";

export function useWatchlistSync() {
  const setWatchlist = useStore((s) => s.setWatchlist);
  const addToWatchlist = useStore((s) => s.addToWatchlist);
  const removeFromWatchlistStore = useStore((s) => s.removeFromWatchlist);

  const loadWatchlist = useCallback(async () => {
    try {
      const saved = await getWatchlist();
      setWatchlist({ saved });
    } catch {
      // Silently fail — not critical on load
    }
  }, [setWatchlist]);

  const saveProperty = useCallback(
    async (property: Property) => {
      // Optimistic add
      addToWatchlist(property);
      try {
        await saveToWatchlist(property.id);
      } catch {
        // Rollback on failure
        removeFromWatchlistStore(property.id);
      }
    },
    [addToWatchlist, removeFromWatchlistStore],
  );

  const unsaveProperty = useCallback(
    async (propertyId: string) => {
      // Optimistic remove
      removeFromWatchlistStore(propertyId);
      try {
        await removeFromWatchlist(propertyId);
      } catch {
        // Can't easily rollback without knowing the full property — just show toast
      }
    },
    [removeFromWatchlistStore],
  );

  return { loadWatchlist, saveProperty, unsaveProperty };
}
