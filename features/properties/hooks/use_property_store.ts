"use client";

/**
 * usePropertyStore — Single source of truth for property data.
 * Loads all properties once into the global store and reactively
 * recomputes store.properties.filtered whenever filters change.
 */

import { useEffect } from "react";
import { getProperties } from "../api/property_api";
import { useStore } from "@/shared/store";
import { propertyFilterService } from "@/shared/services/propertyFilter.service";

export function usePropertyStore() {
  const setProperties = useStore((s) => s.setProperties);
  const all = useStore((s) => s.properties.all);
  const filters = useStore((s) => s.filters);

  // Initial fetch — runs once
  useEffect(() => {
    setProperties({ isLoading: true, error: null });

    getProperties({ limit: 200 })
      .then((data) => {
        setProperties({ all: data, isLoading: false });
      })
      .catch((err: Error) => {
        setProperties({
          isLoading: false,
          error: { code: 0, message: err.message, retryable: true },
        });
      });
  }, [setProperties]);

  // Reactive filter — runs whenever all or filters change
  useEffect(() => {
    if (all.length === 0) return;
    const filtered = propertyFilterService.apply(all, filters);
    setProperties({ filtered });
  }, [all, filters, setProperties]);
}
