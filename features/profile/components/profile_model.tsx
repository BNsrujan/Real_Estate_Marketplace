"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/auth_store";

type ProfileModalProps = {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };

  onProfile?: () => void;
  onSavedProperties?: () => void;
  onSettings?: () => void;
  onLogout?: () => Promise<void> | void;
};

const ProfileModal = ({
  user,
  onLogout,
  onProfile,
  onSavedProperties,
  onSettings,
}: ProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const logout = useAuthStore((state) => state.logout);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        // Optional:
        // close modal from parent
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      if (onLogout) {
        await onLogout();
      }

      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      label: "Profile",
      icon: User,
      onClick: onProfile,
    },
    {
      label: "Saved Properties",
      icon: Bookmark,
      onClick: onSavedProperties,
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: onSettings,
    },
  ];

  return (
    <div
      ref={modalRef}
      className="
        absolute right-0 top-14
        z-50
        w-72
        overflow-hidden
        rounded-3xl
        border border-white/10
        bg-black/70
        backdrop-blur-2xl
        shadow-[0_10px_60px_rgba(0,0,0,0.5)]
        animate-in fade-in zoom-in-95 duration-200
      "
    >
      {/* Header */}
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-full
              bg-gradient-to-br from-zinc-700 to-zinc-900
              text-lg font-semibold text-white
              overflow-hidden
            "
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-white">
              {user?.name || "Guest User"}
            </h3>

            <p className="truncate text-xs text-zinc-400">
              {user?.email || "guest@example.com"}
            </p>

            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck size={12} />
              Verified Account
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="
                group
                flex w-full items-center justify-between
                rounded-2xl
                px-4 py-3
                text-left
                transition-all duration-200
                hover:bg-white/10
                active:scale-[0.98]
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    rounded-xl
                    bg-white/5
                    p-2
                    text-zinc-300
                    transition
                    group-hover:bg-white/10
                    group-hover:text-white
                  "
                >
                  <Icon size={18} />
                </div>

                <span className="text-sm font-medium text-zinc-200">
                  {item.label}
                </span>
              </div>

              <ChevronRight
                size={16}
                className="
                  text-zinc-500
                  transition
                  group-hover:translate-x-1
                  group-hover:text-white
                "
              />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="
            flex w-full items-center gap-3
            rounded-2xl
            px-4 py-3
            text-left
            transition-all duration-200
            hover:bg-red-500/10
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div
            className="
              rounded-xl
              bg-red-500/10
              p-2
              text-red-400
            "
          >
            <LogOut size={18} />
          </div>

          <span className="text-sm font-medium text-red-400">
            {isLoading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;