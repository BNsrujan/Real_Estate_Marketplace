"use client";

import { useEffect, useRef, useState } from "react";
import ProfileModal from "./profile_modal";
import LoginModal from "./login_modal";
import { useAuthStore } from "../store/auth_store";

const Profile = () => {
  const { isLoggedIn, user } = useAuthStore((s) => s);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleProfileClick = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
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
      {isLoggedIn ? (
        <>
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 rounded-full bg-white/20 px-1 py-1 backdrop-blur-md hover:bg-white/30 transition"
          >
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-black font-bold text-xs md:text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </button>

          {profileMenuOpen && <ProfileModal user={user || undefined} />}
        </>
      ) : (
        <>
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md hover:bg-white/30 transition text-white font-medium text-sm"
          >
            Login
          </button>
          <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
        </>
      )}
    </div>
  );
};

export default Profile;