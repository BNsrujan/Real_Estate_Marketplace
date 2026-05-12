"use client";

import ProfileModel from "@/features/profile/components/ProfileModel";
import { Search, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NavBar = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleProfileClick = () => {
    setProfileMenuOpen((prev) => !prev);
  };

    
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-50 w-full flex-col md:flex-row flex justify-between items-center gap-3 md:gap-4 lg:h-24">
   
      <div className="relative w-full md:w-auto">
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full md:w-60 lg:w-72 pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
          size={16}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap justify-center md:justify-end">
        <button className="px-2 md:px-4 py-2 text-xs md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Sale
        </button>

        <button className="px-2 md:px-4 py-2 text-xs md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Rent
        </button>

        <button className="hidden sm:block px-2 md:px-4 py-2 text-xs md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          Commercial
        </button>
      </div>
      <div className="relative" ref={profileRef}>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 rounded-full bg-white/20 px-1 py-1 backdrop-blur-md hover:bg-white/30 transition"
        >
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-black font-bold text-xs md:text-sm">N</span>
          </div>

        </button>

        {profileMenuOpen && (
            <ProfileModel />
        )}
      </div>
    </div>
  );
};

export default NavBar;