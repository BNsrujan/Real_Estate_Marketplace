'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getDashboardProperties } from '@/features/dashboard/api/dashboard_api';
import { deleteProperty, updateProperty } from '@/features/properties/api/property_api';
import { RecordPage, Register, RegisterRow, Cell, EmptyRecord } from '@/shared/ui/record';
import { StatusBadge } from '@/shared/components/common/status_badge';
import { ConfirmDialog } from '@/shared/components/common/confirm_dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toastService } from '@/shared/services/toast.service';
import { SellFormModal } from '@/features/sell/components/sell_form_modal';
import { cn } from '@/lib/utils';
import type { Property, PropertyStatus } from '@/shared/types';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
];

const NEXT_STATUS: Record<string, PropertyStatus> = {
  active: 'sold',
  sold: 'active',
  rented: 'active',
};

function formatPrice(property: Property) {
  return property.priceLabel || Number(property.priceValue).toLocaleString('en-IN');
}

export default function DashboardListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDashboardProperties(statusFilter ? { status: statusFilter } : {})
      .then((result) => {
        if (cancelled) return;
        setProperties(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        toastService.error('Could not load your listings');
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter, reloadToken]);

  function load() {
    setLoading(true);
    setReloadToken((token) => token + 1);
  }

  function changeFilter(value: string) {
    setLoading(true);
    setStatusFilter(value);
  }

  async function handleStatusToggle(property: Property) {
    const next = NEXT_STATUS[property.status] ?? 'active';
    try {
      await updateProperty(property.id, { status: next });
      toastService.success(`Marked as ${next}`);
      load();
    } catch {
      toastService.error('Could not update the listing status');
    }
  }

  async function handleDelete(property: Property) {
    try {
      await deleteProperty(property.id);
      toastService.success('Listing removed');
      load();
    } catch {
      toastService.error('Could not remove the listing');
    }
  }

  return (
    <RecordPage
      eyebrow="Seller Register"
      title="My Listings"
      action={
        <button
          onClick={() => setSellModalOpen(true)}
          className="border border-vermilion bg-vermilion px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground transition-colors duration-[120ms] hover:bg-vermilion-deep"
        >
          List a property
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-px border border-hairline bg-hairline">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => changeFilter(value)}
            className={cn(
              'flex-1 bg-parchment px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-[120ms]',
              statusFilter === value
                ? 'bg-parchment-deep text-ink'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-px border border-hairline bg-hairline">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-parchment px-4 py-5">
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <Register
          columns={['Title', 'Locality', 'Price', 'Status', 'Actions']}
          empty={
            properties.length === 0 ? (
              <EmptyRecord
                title="Nothing listed yet"
                hint="Your listings appear here once you register a property."
                action={
                  <button
                    onClick={() => setSellModalOpen(true)}
                    className="border border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors duration-[120ms] hover:bg-ink hover:text-parchment"
                  >
                    List a property
                  </button>
                }
              />
            ) : undefined
          }
        >
          {properties.map((property) => (
            <RegisterRow key={property.id}>
              <Cell label="Title" className="sm:flex-[2]">
                <p className="truncate font-medium text-ink">{property.title}</p>
                <p className="label mt-1">{property.type.replace('_', ' ')}</p>
              </Cell>
              <Cell label="Locality">
                <p className="truncate text-sm text-ink-muted">
                  {[property.city, property.districtName].filter(Boolean).join(', ') || '—'}
                </p>
              </Cell>
              <Cell label="Price">
                <p className="figure text-sm text-ink">{formatPrice(property)}</p>
              </Cell>
              <Cell label="Status">
                <StatusBadge status={property.status} />
              </Cell>
              <Cell label="Actions" className="sm:max-w-[180px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(property)}
                    className="border border-hairline-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink transition-colors duration-[120ms] hover:bg-parchment-deep"
                  >
                    Mark {NEXT_STATUS[property.status] ?? 'active'}
                  </button>
                  <ConfirmDialog
                    title="Remove this listing?"
                    description={`"${property.title}" will be permanently removed, along with its images and enquiries.`}
                    confirmLabel="Remove"
                    destructive
                    onConfirm={() => handleDelete(property)}
                    trigger={
                      <button
                        aria-label={`Remove ${property.title}`}
                        className="border border-hairline-strong p-1.5 text-ink-muted transition-colors duration-[120ms] hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    }
                  />
                </div>
              </Cell>
            </RegisterRow>
          ))}
        </Register>
      )}
      {sellModalOpen && (
        <SellFormModal
          onClose={() => {
            setSellModalOpen(false);
            load();
          }}
        />
      )}
    </RecordPage>
  );
}
