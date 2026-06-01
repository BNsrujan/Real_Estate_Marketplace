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
            className="flex h-11 w-11 md:h-auto md:w-auto items-center justify-center md:gap-2 rounded-full bg-background/90 md:bg-white/20 p-1 backdrop-blur-md border border-border/40 md:border-0 shadow-sm md:shadow-none hover:bg-background/95 md:hover:bg-white/30 transition"
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
          className="flex h-11 items-center gap-2 rounded-full md:rounded-lg bg-background/90 md:bg-white/20 px-4 py-2 backdrop-blur-md border border-border/40 md:border-0 shadow-sm md:shadow-none hover:bg-background/95 md:hover:bg-white/30 transition text-foreground md:text-white font-medium text-sm"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default Profile;
