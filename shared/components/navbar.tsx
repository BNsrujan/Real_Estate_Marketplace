"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/shared/store";
import type { FilterState } from "@/shared/types";

type ListingFilter = FilterState["listingType"];

const MD3_EASE = "ease-[cubic-bezier(0.2,0,0,1)]";

const NavBar = () => {
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const activeListingType = useStore((s) => s.filters.listingType);
  const activeTypes = useStore((s) => s.filters.types);
  const activeDistrict = useStore((s) => s.filters.activeDistrict);
  const searchQuery = useStore((s) => s.filters.searchQuery);

  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters({ searchQuery: value });
      }, 300);
    },
    [setFilters],
  );

  const handleListingFilter = useCallback(
    (type: ListingFilter) => {
      setFilters({ listingType: activeListingType === type ? "all" : type });
    },
    [activeListingType, setFilters],
  );

  const hasActiveFilters =
    activeListingType !== "all" ||
    activeTypes.length > 0 ||
    searchQuery.trim() !== "" ||
    activeDistrict !== null;

  return (
    <div className="relative z-50 w-full flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 lg:h-24">
      {/* Search */}
      <div className="relative w-full min-w-60 md:w-auto group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search properties..."
          className={`w-full min-w-60 md:w-64 pl-10 pr-8 py-2.5 rounded-full bg-background/85 backdrop-blur-md border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 text-sm transition-all duration-200 ${MD3_EASE}`}
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
          size={16}
        />
        {inputValue && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 active:scale-90"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 md:mx-4 md:justify-end justify-start ">
        {/* District reset pill */}
        {activeDistrict && (
          <button
            onClick={() => setFilters({ activeDistrict: null })}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full backdrop-blur-md active:scale-95 transition-all duration-200 ${MD3_EASE} bg-primary text-primary-foreground shadow-sm `}
          >
            {activeDistrict}
            <X size={11} />
          </button>
        )}

        <button
          onClick={() => handleListingFilter("sale")}
          className={`px-3 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full backdrop-blur-md active:scale-95 transition-all duration-200 ${MD3_EASE} ${
            activeListingType === "sale"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-background/80 border border-border/40 text-foreground hover:bg-background/95"
          }`}
        >
          For Sale
        </button>

        <button
          onClick={() => handleListingFilter("rent")}
          className={`px-3 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full backdrop-blur-md active:scale-95 transition-all duration-200 ${MD3_EASE} ${
            activeListingType === "rent"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-background/80 border border-border/40 text-foreground hover:bg-background/95"
          }`}
        >
          For Rent
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={`px-3 py-2 text-xs text-nowrap rounded-full bg-background/70 backdrop-blur-md border border-border/30 text-muted-foreground hover:bg-background/90 hover:text-foreground active:scale-95 transition-all duration-200 ${MD3_EASE}`}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
