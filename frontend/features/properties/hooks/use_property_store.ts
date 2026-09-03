"use client";

/**
 * usePropertyStore — Single source of truth for property data.
 * Loads all properties once into the global store and reactively
 * recomputes store.properties.filtered whenever filters change.
 */

import { useEffect, useRef } from "react";
import { getProperties } from "../api/property_api";
import { useStore } from "@/shared/store";
import { propertyFilterService } from "@/shared/services/propertyFilter.service";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function usePropertyStore() {
  const setProperties = useStore((s) => s.setProperties);
  const all = useStore((s) => s.properties.all);
  const filters = useStore((s) => s.filters);
  const requestIdRef = useRef(0);

  // Initial fetch — runs once
  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    setProperties({ isLoading: true, error: null });

    getProperties({ limit: 200 }, { signal: controller.signal })
      .then((data) => {
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setProperties({ all: data, isLoading: false });
        }
      })
      .catch((err: Error) => {
        if (isAbortError(err)) return;
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setProperties({
            isLoading: false,
            error: { code: 0, message: err.message, retryable: true },
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [setProperties]);

  // Reactive filter — runs whenever all or filters change
  useEffect(() => {
    const filtered = propertyFilterService.apply(all, filters);
    setProperties({ filtered });
  }, [all, filters, setProperties]);
}
