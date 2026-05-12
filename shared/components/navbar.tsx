"use client";


import { Search } from "lucide-react";


const NavBar = () => {

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
      <div className="flex gap-2  justify-center md:justify-end">
        <button className="px-2 md:px-4 py-2 text-x text-nowrap md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Sale
        </button>

        <button className="px-2 md:px-4 py-2 text-xs text-nowrap md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          For Rent
        </button>

        <button className="hidden sm:block px-2 md:px-4 text-nowrap py-2 text-xs md:text-sm rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition">
          Commercial
        </button>
      </div>

   
    </div>
  );
};

export default NavBar;