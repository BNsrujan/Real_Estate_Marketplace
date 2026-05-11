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
    <div className="absolute top-0 left-0 z-50 w-full h-24 flex justify-between items-center px-6">
   
      <div className="relative">
        <input
          type="text"
          placeholder="Search properties..."
          className="w-72 pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
          size={16}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Sale
        </button>

        <button className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Rent
        </button>

        <button className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          Commercial
        </button>
      </div>
      <div className="relative" ref={profileRef}>
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 rounded-full bg-white/20 px-1 py-1 backdrop-blur-md hover:bg-white/30 transition"
        >
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-black font-bold">N</span>
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