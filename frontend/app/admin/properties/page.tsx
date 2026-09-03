'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { listAllProperties, setPropertyStatus, toggleFeatured } from '@/features/admin/api/admin_api';
import { RecordPage, Register, RegisterRow, Cell, EmptyRecord } from '@/shared/ui/record';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toastService } from '@/shared/services/toast.service';
import { cn } from '@/lib/utils';
import type { Property } from '@/shared/types';

const STATUSES = ['active', 'sold', 'rented'];
const PAGE_SIZE = 50;

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    listAllProperties({ limit: PAGE_SIZE })
      .then((result) => setProperties(result.data))
      .catch(() => toastService.error('Could not load properties'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await setPropertyStatus(id, status);
      setProperties((prev) =>
        prev.map((property) =>
          property.id === id ? { ...property, status: status as Property['status'] } : property,
        ),
      );
    } catch {
      toastService.error('Could not change the status');
    } finally {
      setUpdating(null);
    }
  }

  async function handleFeatured(id: string, isFeatured: boolean) {
    setUpdating(id);
    try {
      await toggleFeatured(id, !isFeatured);
      setProperties((prev) =>
        prev.map((property) =>
          property.id === id ? { ...property, isFeatured: !isFeatured } : property,
        ),
      );
    } catch {
      toastService.error('Could not change the featured mark');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <RecordPage eyebrow="Registry Office" title="All Properties">
      {loading ? (
        <div className="space-y-px border border-hairline bg-hairline">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-parchment px-4 py-5">
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <Register
          columns={['Property', 'Type', 'Price', 'Status', 'Featured']}
          empty={properties.length === 0 ? <EmptyRecord title="No properties filed" /> : undefined}
        >
          {properties.map((property) => (
            <RegisterRow key={property.id}>
              <Cell label="Property" className="sm:flex-[2]">
                <p className="truncate font-medium text-ink">{property.title}</p>
                <p className="label mt-1">{property.districtName}</p>
              </Cell>
              <Cell label="Type">
                <p className="text-sm capitalize text-ink-muted">
                  {property.type.replace(/_/g, ' ')}
                </p>
              </Cell>
              <Cell label="Price">
                <p className="figure text-sm text-ink">{property.priceLabel}</p>
              </Cell>
              <Cell label="Status">
                <select
                  value={property.status}
                  disabled={updating === property.id}
                  onChange={(event) => handleStatus(property.id, event.target.value)}
                  className="border border-hairline-strong bg-parchment px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-vermilion disabled:opacity-50"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Cell>
              <Cell label="Featured">
                <button
                  disabled={updating === property.id}
                  onClick={() => handleFeatured(property.id, property.isFeatured)}
                  aria-label={property.isFeatured ? 'Remove featured mark' : 'Mark as featured'}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center border transition-colors duration-[120ms] disabled:opacity-50',
                    property.isFeatured
                      ? 'border-vermilion/40 bg-vermilion/8 text-vermilion'
                      : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink',
                  )}
                >
                  <Star size={13} fill={property.isFeatured ? 'currentColor' : 'none'} />
                </button>
              </Cell>
            </RegisterRow>
          ))}
        </Register>
      )}
    </RecordPage>
  );
}
