"use client";

import { DropdownMenu } from "radix-ui";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/shared/store";
import type { UserProfile } from "@/shared/types";

const MD3_EASE = "ease-[cubic-bezier(0.2,0,0,1)]";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface AvatarMenuProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function AvatarMenu({ onProfileClick, onSettingsClick }: AvatarMenuProps) {
  const user = useStore((s) => s.auth.user) as UserProfile;
  const logout = useStore((s) => s.logout);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-primary/8 active:bg-primary/12 active:scale-95 transition-all duration-200 ${MD3_EASE} focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
          aria-label="Open user menu"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary text-xs font-semibold ring-2 ring-primary/20">
              {user?.name ? getInitials(user.name) : <User size={14} />}
            </div>
          )}
          <ChevronDown
            size={14}
            className="text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={`z-50 min-w-52 overflow-hidden rounded-2xl bg-card border border-border shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 transition-all duration-200 ${MD3_EASE}`}
        >
          {/* User info header */}
          <div className="px-3 py-2.5 mb-1">
            <p className="text-sm font-semibold text-foreground leading-none">
              {user?.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>

          <DropdownMenu.Separator className="h-px bg-border mx-1 mb-1" />

          <DropdownMenu.Item
            onSelect={onProfileClick}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground cursor-pointer select-none outline-none hover:bg-primary/8 active:bg-primary/12 transition-colors duration-150 ${MD3_EASE}`}
          >
            <User size={16} className="text-muted-foreground" />
            Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={onSettingsClick}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground cursor-pointer select-none outline-none hover:bg-primary/8 active:bg-primary/12 transition-colors duration-150 ${MD3_EASE}`}
          >
            <Settings size={16} className="text-muted-foreground" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border mx-1 my-1" />

          <DropdownMenu.Item
            onSelect={logout}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive cursor-pointer select-none outline-none hover:bg-destructive/8 active:bg-destructive/12 transition-colors duration-150 ${MD3_EASE}`}
          >
            <LogOut size={16} />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
