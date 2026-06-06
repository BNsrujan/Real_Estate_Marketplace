"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getProperties, type PropertyFilters } from "../api/property_api";
import type { Property } from "@/shared/types";

interface UsePropertiesOptions {
  district?: string | null;
  filters?: Omit<PropertyFilters, "district">;
}

interface UsePropertiesResult {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const filters = options.filters;
  const requestKey = useMemo(
    () =>
      JSON.stringify({
        district: options.district ?? null,
        filters: filters ?? {},
      }),
    [options.district, filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    queueMicrotask(() => {
      if (requestIdRef.current !== requestId || controller.signal.aborted) return;
      setIsLoading(true);
      setError(null);
    });

    const parsed = JSON.parse(requestKey) as {
      district: string | null;
      filters: Omit<PropertyFilters, "district">;
    };
    const filters: PropertyFilters = {
      ...parsed.filters,
      ...(parsed.district ? { district: parsed.district } : {}),
    };

    getProperties(filters, { signal: controller.signal })
      .then((data) => {
        if (requestIdRef.current === requestId) setProperties(data);
      })
      .catch((err: Error) => {
        if (isAbortError(err)) return;
        if (requestIdRef.current === requestId) setError(err.message);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [requestKey]);

  return { properties, isLoading, error };
}
