"use client";

import { useState, useEffect } from "react";
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

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const filters: PropertyFilters = {
      ...options.filters,
      ...(options.district ? { district: options.district } : {}),
    };

    getProperties(filters)
      .then((data) => {
        if (!cancelled) setProperties(data);
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
