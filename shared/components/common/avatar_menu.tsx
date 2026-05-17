'use client';

import { User, Settings, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { useStore } from '@/shared/store';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/shared/types';

interface AvatarMenuProps {
  user: UserProfile;
  onLogout: () => void;
  onEditProfile?: () => void;
  className?: string;
}

export function AvatarMenu({ user, onLogout, onEditProfile, className }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[100px] truncate">{user.name ?? user.email}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border border-white/10 bg-zinc-900/95 py-1.5 shadow-xl backdrop-blur-xl">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white truncate">{user.name ?? '—'}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            <p className="mt-0.5 text-[10px] text-zinc-600 capitalize">{user.role}</p>
          </div>
          <Separator className="my-1 bg-white/10" />

          {['seller', 'agent', 'admin'].includes(user.role) && (
            <MenuItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" onClick={() => setOpen(false)} />
          )}
          {user.role === 'admin' && (
            <MenuItem icon={Settings} label="Admin Panel" href="/admin" onClick={() => setOpen(false)} />
          )}
          {onEditProfile && (
            <MenuItem icon={User} label="Edit Profile" onClick={() => { setOpen(false); onEditProfile(); }} />
          )}

          <Separator className="my-1 bg-white/10" />
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
}: { icon: React.ComponentType<{ className?: string }>; label: string; href?: string; onClick: () => void }) {
  const content = (
    <span className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors w-full">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="block w-full">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}
