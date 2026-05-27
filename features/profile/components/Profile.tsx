"use client";

import { useEffect, useRef, useState } from "react";
import ProfileModal from "./profile_modal";
import { useStore } from "@/shared/store";
import { useSidebarStore } from "@/features/sidebar/store/sidebar_store";

const RADIX_DIALOG_SELECTOR = [
  "[data-radix-portal]",
  "[data-slot='dialog-content']",
  "[data-slot='dialog-overlay']",
  "[role='dialog']",
].join(",");

const Profile = () => {
  const user = useStore((s) => s.auth.user);
  const openLoginModal = useStore((s) => s.openLoginModal);
  const closePanel = useSidebarStore((s) => s.closePanel);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Clicks inside Radix portals (dialogs, drawers) live in document.body outside
      // profileRef — don't treat those as "outside" clicks.
      if (target?.closest?.(RADIX_DIALOG_SELECTOR)) return;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={profileRef}>
      {user ? (
        <>
          <button
            onClick={() => { closePanel(); setProfileMenuOpen((p) => !p); }}
            className="flex items-center gap-2 rounded-full bg-white/20 px-1 py-1 backdrop-blur-md hover:bg-white/30 transition"
          >
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-black font-bold text-xs md:text-sm">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
          </button>
          {profileMenuOpen && <ProfileModal user={user} />}
        </>
      ) : (
        <button
          onClick={() => openLoginModal()}
          className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-md hover:bg-white/30 transition text-white font-medium text-sm"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default Profile;
