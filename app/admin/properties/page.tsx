'use client';

import { useEffect, useState } from 'react';
import { listAllProperties, setPropertyStatus, toggleFeatured } from '@/features/admin/api/admin_api';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { Property } from '@/shared/types';

const STATUSES = ['active', 'sold', 'rented'];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    listAllProperties({ limit: 50 })
      .then((r) => setProperties(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await setPropertyStatus(id, status);
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: status as Property['status'] } : p));
    } catch {
      //
    } finally {
      setUpdating(null);
    }
  }

  async function handleFeatured(id: string, isFeatured: boolean) {
    setUpdating(id);
    try {
      await toggleFeatured(id, !isFeatured);
      setProperties((prev) => prev.map((p) => p.id === id ? { ...p, isFeatured: !isFeatured } : p));
    } catch {
      //
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Properties</h1>
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Property</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Featured</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                  </tr>
                ))
              : properties.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white line-clamp-1">{p.title}</p>
                      <p className="text-xs text-zinc-500">{p.districtName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-zinc-400 text-xs">{p.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">{p.priceLabel}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        disabled={updating === p.id}
                        onChange={(e) => handleStatus(p.id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-50"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        disabled={updating === p.id}
                        onClick={() => handleFeatured(p.id, p.isFeatured)}
                        className={cn(
                          'flex items-center justify-center h-7 w-7 rounded-lg transition-colors disabled:opacity-50',
                          p.isFeatured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-zinc-600 hover:text-zinc-400',
                        )}
                      >
                        <Star size={14} fill={p.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
