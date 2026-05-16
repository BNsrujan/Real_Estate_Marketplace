"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Mail,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "../store/auth_store";
import DialogModule from "@/shared/components/common/dialogmodule";

type ProfileModalProps = {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => Promise<void> | void;
};

import { PROFILE_FORM_FIELDS, SETTINGS_FORM_FIELDS } from "../constants/forms";

const ProfileModal = ({
  user,
  onLogout,
}: ProfileModalProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onLogout) await onLogout();
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    console.log("Updating profile:", data);
    // In a real app, you'd call an API here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // toast.success("Profile updated successfully");
  };

  const handleSettingsUpdate = async (data: any) => {
    console.log("Updating settings:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // toast.success("Settings saved");
  };

  return (
    <div
      ref={modalRef}
      className="
        absolute right-0 top-14
        z-50
        w-80
        overflow-hidden
        rounded-[2rem]
        border border-white/10
        bg-[#0a0a0a]/80
        backdrop-blur-3xl
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        animate-in fade-in zoom-in-95 duration-300
      "
    >
      {/* User Info Section */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="w-10 h-10 text-zinc-400" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate leading-tight">
              {user?.name || "Premium User"}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <ShieldCheck size={12} />
              </div>
              <span className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider">Verified Pro</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
          <Mail size={12} className="text-zinc-500" />
          <span className="text-xs text-zinc-400 truncate">{user?.email || "user@example.com"}</span>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-1">
       
        <DialogModule
          title="Edit Profile"
          description="Update your personal information and how others see you."
          fields={PROFILE_FORM_FIELDS(user)}
          onSubmit={handleProfileUpdate}
          trigger={
            <button className="group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:bg-white/5 active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-zinc-800/50 p-2 text-zinc-400 group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Profile Details</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </button>
          }
        />

        {/* Settings Dialog */}
        <DialogModule
          title="App Settings"
          description="Customize your experience and notification preferences."
          fields={SETTINGS_FORM_FIELDS}
          onSubmit={handleSettingsUpdate}
          trigger={
            <button className="group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:bg-white/5 active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-zinc-800/50 p-2 text-zinc-400 group-hover:text-white transition-colors">
                  <Settings size={18} />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Preferences</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </button>
          }
        />
      </div>

      
      <div className="p-3 border-t border-white/5 bg-white/[0.02]">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50"
        >
          <div className="rounded-xl bg-red-500/10 p-2 text-red-400">
            <LogOut size={18} />
          </div>
          <span className="text-sm font-semibold text-red-400">
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;