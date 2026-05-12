"use client";

import { useEffect, useRef, useState } from "react";
import ProfileModel from "./ProfileModel";

const Profile = () => {
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
        <div className="relative z-50 " ref={profileRef}>
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
    )
}


export default Profile;