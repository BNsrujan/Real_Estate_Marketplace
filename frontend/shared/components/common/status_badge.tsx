'use client';

import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'sold' | 'rented' | 'pending' | 'draft' | 'published' | 'archived' | 'replied' | 'closed';

const variants: Record<StatusVariant, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  sold: 'bg-red-500/20 text-red-400 border-red-500/30',
  rented: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  draft: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  replied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  closed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const labels: Record<StatusVariant, string> = {
  active: 'Active',
  sold: 'Sold',
  rented: 'Rented',
  pending: 'Pending',
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  replied: 'Replied',
  closed: 'Closed',
};

interface StatusBadgeProps {
  status: StatusVariant | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status as StatusVariant;
  const colorClass = variants[key] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  const label = labels[key] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
