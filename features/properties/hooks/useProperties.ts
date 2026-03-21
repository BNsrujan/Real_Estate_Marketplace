"use client";

import { useState, useEffect } from "react";
import { fetchProperties } from "../services/propertyService";
import type { Property } from "@/types";

interface UsePropertiesOptions {
  /** Optional district filter — pass null/undefined for all properties */
  district?: string | null;
}

interface UsePropertiesResult {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Client-side hook for fetching and optionally filtering properties.
 * Re-runs automatically when `district` changes.
 */
export function useProperties(
  options: UsePropertiesOptions = {}
): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchProperties()
      .then((data) => {
        if (cancelled) return;
        const filtered = options.district
          ? data.filter(
              (p) =>
                p.district.toLowerCase() ===
                options.district!.toLowerCase()
            )
          : data;
        setProperties(filtered);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [options.district]);

  return { properties, isLoading, error };
}
