"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/shared/store";
import type { FilterState } from "@/shared/types";

type ListingFilter = FilterState["listingType"];
type TypeFilter = "commercial" | null;

const NavBar = () => {
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const activeListingType = useStore((s) => s.filters.listingType);
  const activeTypes = useStore((s) => s.filters.types);
  const activeDistrict = useStore((s) => s.filters.activeDistrict);
  const searchQuery = useStore((s) => s.filters.searchQuery);

  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external store changes (e.g. reset) back to input
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

  const handleTypeFilter = useCallback(
    (filter: TypeFilter) => {
      if (filter === "commercial") {
        const isActive =
          activeTypes.includes("commercial_space") &&
          activeTypes.includes("commercial_plot");
        setFilters({
          types: isActive ? [] : ["commercial_space", "commercial_plot"],
        });
      }
    },
    [activeTypes, setFilters],
  );

  const hasActiveFilters =
    activeListingType !== "all" ||
    activeTypes.length > 0 ||
    searchQuery.trim() !== "" ||
    activeDistrict !== null;

  const isCommercialActive =
    activeTypes.includes("commercial_space") &&
    activeTypes.includes("commercial_plot");

  return (
    <div className="relative z-50 w-full flex-col md:flex-row flex justify-between md:items-center gap-3 md:gap-4 lg:h-24">
      {/* Search */}

      
      <div className="relative w-full min-w-60 md:w-auto">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search properties..."
          className="w-full min-w-60 md:w-60 pl-10 pr-8 py-2 rounded-full bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 text-sm"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
          size={16}
        />
        {inputValue && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
          >
            <X size={12} />
          </button>
        )}
      </div>
     

      {/* Filters */}
      <div className="flex gap-2 md:mx-4  md:justify-end ">
        {/* District reset pill */}
        {activeDistrict && (
          <button
            onClick={() => setFilters({ activeDistrict: null })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-nowrap rounded-full bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/40 transition"
          >
            {activeDistrict}
            <X size={11} />
          </button>
        )}

        <button
          onClick={() => handleListingFilter("sale")}
          className={`px-2 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full backdrop-blur-md text-white hover:bg-white/30 transition ${
            activeListingType === "sale"
              ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-300"
              : "bg-white/20"
          }`}
        >
          For Sale
        </button>

        <button
          onClick={() => handleListingFilter("rent")}
          className={`px-2 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full backdrop-blur-md text-white hover:bg-white/30 transition ${
            activeListingType === "rent"
              ? "bg-emerald-500/30 border border-emerald-500/50 text-emerald-300"
              : "bg-white/20"
          }`}
        >
          For Rent
        </button>

        {/* <button
          onClick={() => handleTypeFilter("commercial")}
          className={`hidden sm:block px-2 md:px-4 text-nowrap py-2 text-xs md:text-sm rounded-full backdrop-blur-md text-white hover:bg-white/30 transition ${
            isCommercialActive
              ? "bg-blue-500/40 border border-blue-400/60"
              : "bg-white/20"
          }`}
        >
          Commercial
        </button> */}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-2 md:px-3 py-2 text-xs text-nowrap rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition"
          >
            Clear all
          </button>
        )}

      </div>
    </div>
  );
};

export default NavBar;
