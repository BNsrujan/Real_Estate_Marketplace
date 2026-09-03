"use client";

import { DropdownMenu } from "radix-ui";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/shared/store";
import { UserAvatar } from "@/shared/ui/user_avatar";
import type { UserProfile } from "@/shared/types";

const ITEM_CLASS =
  "flex items-center gap-3 px-3 py-2.5 text-sm text-ink cursor-pointer select-none outline-none transition-colors duration-[120ms] hover:bg-parchment-deep focus:bg-parchment-deep";

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
          className="flex items-center gap-2 px-1 py-1 transition-colors duration-[120ms] hover:bg-parchment-deep focus:outline-none focus-visible:ring-1 focus-visible:ring-vermilion"
          aria-label="Open user menu"
        >
          <UserAvatar src={user?.avatarUrl} name={user?.name} size={30} />
          <ChevronDown
            size={13}
            className="text-ink-muted transition-transform duration-200 [[data-state=open]_&]:rotate-180"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 overflow-hidden border border-hairline-strong bg-parchment p-0 shadow-[0_18px_50px_-20px_rgba(14,13,11,0.45)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <div className="border-b border-hairline px-3 py-3">
            <p className="text-sm font-medium leading-none text-ink">{user?.name}</p>
            <p className="figure mt-1.5 truncate text-xs text-ink-muted">{user?.email}</p>
          </div>

          <DropdownMenu.Item onSelect={onProfileClick} className={ITEM_CLASS}>
            <User size={15} className="text-ink-muted" />
            Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item onSelect={onSettingsClick} className={ITEM_CLASS}>
            <Settings size={15} className="text-ink-muted" />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-hairline" />

          <DropdownMenu.Item
            onSelect={logout}
            className="flex cursor-pointer select-none items-center gap-3 px-3 py-2.5 text-sm text-destructive outline-none transition-colors duration-[120ms] hover:bg-destructive/8 focus:bg-destructive/8"
          >
            <LogOut size={15} />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
