"use client";

import { useState } from "react";
import {
  LogOut, Settings, User, Mail, Phone,
  ChevronRight, Shield, Star,
} from "lucide-react";
import { useAuthStore } from "../store/auth_store";
import { useStore } from "@/shared/store";
import ProfileDetailsDialog from "./profile_details_dialog";
import AppSettingsDialog from "./app_settings_dialog";

type ProfileModalProps = {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => Promise<void> | void;
};

const ROLE_META: Record<string, { label: string; color: string }> = {
  admin:  { label: "Admin",  color: "text-red-400 bg-red-500/10 border-red-500/20" },
  agent:  { label: "Agent",  color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  seller: { label: "Seller", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  buyer:  { label: "Buyer",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default function ProfileModal({ user, onLogout }: ProfileModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const fullUser = useStore((s) => s.auth.user);

  const role = fullUser?.role ?? "buyer";
  const roleMeta = ROLE_META[role] ?? ROLE_META.buyer;
  const isPro = fullUser?.isPro;
  const isVerified = fullUser?.isVerified;
  const initials = (user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) await onLogout();
      logout();
    } catch {
      // silent
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-200">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-white/10 text-base font-bold text-white">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="h-full w-full rounded-xl object-cover" />
                : initials}
            </div>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-zinc-950">
                <Shield size={8} className="text-white" />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-snug">
              {user?.name ?? "User"}
            </p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
              {isPro && (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                  <Star size={8} fill="currentColor" /> Pro
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-white/6 bg-white/4 px-3 py-2">
          <Mail size={12} className="text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">{user?.email ?? "—"}</span>
        </div>

        {/* Phone (if available) */}
        {fullUser?.phone && (
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/6 bg-white/4 px-3 py-2">
            <Phone size={12} className="text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-400">{fullUser.phone}</span>
          </div>
        )}
      </div>

      {/* ── Menu items ── */}
      <div className="border-t border-white/8 px-2 py-2 space-y-0.5">
        <ProfileDetailsDialog user={user} fullUser={fullUser}>
          <MenuItem icon={User} label="Profile Details" />
        </ProfileDetailsDialog>

        <AppSettingsDialog>
          <MenuItem icon={Settings} label="App Settings" />
        </AppSettingsDialog>
      </div>

      {/* ── Sign out ── */}
      <div className="border-t border-white/8 px-2 py-2">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium text-red-400">
            {isLoggingOut ? "Signing out…" : "Sign Out"}
          </span>
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/6 text-zinc-400 group-hover:text-white transition-colors">
        <Icon size={15} />
      </div>
      <span className="flex-1 text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </div>
  );
}
