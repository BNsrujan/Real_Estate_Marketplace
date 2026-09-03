"use client";

import { useState, useEffect, useRef } from "react";
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

  const district = options.district ?? null;
  const {
    type,
    listing,
    minPrice,
    maxPrice,
    search,
    featured,
    page,
    limit,
  } = options.filters ?? {};

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    queueMicrotask(() => {
      if (requestIdRef.current !== requestId || controller.signal.aborted) return;
      setIsLoading(true);
      setError(null);
    });

    const requestFilters: PropertyFilters = {
      ...(type ? { type } : {}),
      ...(listing ? { listing } : {}),
      ...(minPrice !== undefined ? { minPrice } : {}),
      ...(maxPrice !== undefined ? { maxPrice } : {}),
      ...(search ? { search } : {}),
      ...(featured !== undefined ? { featured } : {}),
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(district ? { district } : {}),
    };

    getProperties(requestFilters, { signal: controller.signal })
      .then((data) => {
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setProperties(data);
        }
      })
      .catch((err: Error) => {
        if (isAbortError(err)) return;
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (requestIdRef.current === requestId && !controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    district,
    type,
    listing,
    minPrice,
    maxPrice,
    search,
    featured,
    page,
    limit,
  ]);

  return { properties, isLoading, error };
}
