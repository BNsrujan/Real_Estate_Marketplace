'use client';

import { cn } from '@/lib/utils';

type StatusVariant =
  | 'active' | 'sold' | 'rented'
  | 'pending' | 'replied' | 'closed'
  | 'draft' | 'published' | 'archived';

const marks: Record<StatusVariant, string> = {
  active: 'border-survey/40 text-survey bg-survey/8',
  published: 'border-survey/40 text-survey bg-survey/8',
  replied: 'border-survey/40 text-survey bg-survey/8',
  sold: 'border-vermilion/40 text-vermilion bg-vermilion/8',
  rented: 'border-vermilion/40 text-vermilion bg-vermilion/8',
  pending: 'border-hairline-strong text-ink bg-parchment-deep',
  draft: 'border-hairline text-ink-muted bg-transparent',
  archived: 'border-hairline text-ink-muted bg-transparent',
  closed: 'border-hairline text-ink-muted bg-transparent',
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

  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]',
        marks[key] ?? 'border-hairline text-ink-muted',
        className,
      )}
    >
      {labels[key] ?? status}
    </span>
  );
}
