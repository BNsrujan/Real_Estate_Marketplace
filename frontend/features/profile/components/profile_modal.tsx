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
import { UserAvatar } from '@/shared/ui/user_avatar';

type ProfileModalProps = {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => Promise<void> | void;
};

const ROLE_META: Record<string, { label: string; color: string }> = {
  admin:  { label: "Admin",  color: "text-destructive bg-destructive/10 border-destructive/20" },
  agent:  { label: "Agent",  color: "text-primary bg-primary/10 border-primary/20" },
  seller: { label: "Seller", color: "text-primary bg-secondary border-primary/20" },
  buyer:  { label: "Buyer",  color: "text-primary bg-secondary border-primary/20" },
};

export default function ProfileModal({ user, onLogout }: ProfileModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const fullUser = useStore((s) => s.auth.user);

  const role = fullUser?.role ?? "buyer";
  const roleMeta = ROLE_META[role] ?? ROLE_META.buyer;
  const isPro = fullUser?.isPro;
  const isVerified = fullUser?.isVerified;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) await onLogout();
      await logout();
    } catch {
      // silent
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-none border border-border bg-card shadow-lg shadow-black/10 animate-in fade-in zoom-in-95 duration-200 ease-[cubic-bezier(0.2,0,0,1)]">

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
            <UserAvatar src={user?.avatar} name={user?.name} size={48} />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-none bg-primary border-2 border-card">
                <Shield size={8} className="text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-snug">
              {user?.name ?? "User"}
            </p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center rounded-none border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
              {isPro && (
                <span className="inline-flex items-center gap-0.5 rounded-none border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Star size={8} fill="currentColor" /> Pro
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mt-3.5 flex items-center gap-2 rounded-none border border-border bg-muted px-3 py-2">
          <Mail size={12} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{user?.email ?? "—"}</span>
        </div>

        {/* Phone */}
        {fullUser?.phone && (
          <div className="mt-1.5 flex items-center gap-2 rounded-none border border-border bg-muted px-3 py-2">
            <Phone size={12} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">{fullUser.phone}</span>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        <ProfileDetailsDialog user={user} fullUser={fullUser}>
          <MenuItem icon={User} label="Profile Details" />
        </ProfileDetailsDialog>

        <AppSettingsDialog>
          <MenuItem icon={Settings} label="App Settings" />
        </AppSettingsDialog>
      </div>

      {/* Sign out */}
      <div className="border-t border-border px-2 py-2">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex w-full items-center gap-3 rounded-none px-3 py-2.5 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-destructive/8 active:scale-[0.98] disabled:opacity-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors duration-200">
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium text-destructive">
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
    <div className="group flex w-full items-center gap-3 rounded-none px-3 py-2.5 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-primary/8 active:scale-[0.98]">
      <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-200">
        <Icon size={15} />
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
    </div>
  );
}
