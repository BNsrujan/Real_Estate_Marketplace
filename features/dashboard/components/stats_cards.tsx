'use client';

import { Home, CheckCircle, Key, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { DashboardStats } from '@/shared/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

const CARDS = [
  { key: 'activeCount', label: 'Active Listings', icon: Home, color: 'text-green-400' },
  { key: 'soldCount', label: 'Sold', icon: CheckCircle, color: 'text-blue-400' },
  { key: 'rentedCount', label: 'Rented', icon: Key, color: 'text-purple-400' },
  { key: 'enquiryCount', label: 'Enquiries', icon: MessageSquare, color: 'text-yellow-400' },
] as const;

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">{label}</p>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          {isLoading || !stats ? (
            <Skeleton className="mt-2 h-7 w-12" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-white">{stats[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
