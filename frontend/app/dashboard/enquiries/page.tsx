'use client';

import { useEffect, useState } from 'react';
import { getDashboardEnquiries } from '@/features/dashboard/api/dashboard_api';
import { updateEnquiryStatus } from '@/features/properties/api/enquiry_api';
import { RecordPage, Register, RegisterRow, Cell, EmptyRecord } from '@/shared/ui/record';
import { StatusBadge } from '@/shared/components/common/status_badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toastService } from '@/shared/services/toast.service';
import { cn } from '@/lib/utils';
import type { EnquiryWithProperty } from '@/shared/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
];

const NEXT_STATUS: Record<string, string> = {
  pending: 'replied',
  replied: 'closed',
  closed: 'pending',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDashboardEnquiries(statusFilter ? { status: statusFilter } : {})
      .then((result) => {
        if (cancelled) return;
        setEnquiries(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        toastService.error('Could not load enquiries');
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

  async function handleAdvance(enquiry: EnquiryWithProperty) {
    const next = NEXT_STATUS[enquiry.status] ?? 'replied';
    try {
      await updateEnquiryStatus(enquiry.id, next);
      toastService.success(`Enquiry marked ${next}`);
      load();
    } catch {
      toastService.error('Could not update the enquiry');
    }
  }

  return (
    <RecordPage eyebrow="Seller Register" title="Enquiries">
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
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <Register
          columns={['Property', 'Message', 'Contact', 'Received', 'Status']}
          empty={
            enquiries.length === 0 ? (
              <EmptyRecord
                title="No enquiries recorded"
                hint="Buyer enquiries on your listings are filed here as they arrive."
              />
            ) : undefined
          }
        >
          {enquiries.map((enquiry) => (
            <RegisterRow key={enquiry.id} className="sm:items-start">
              <Cell label="Property">
                <p className="truncate text-sm font-medium text-ink">{enquiry.propertyTitle}</p>
              </Cell>
              <Cell label="Message" className="sm:flex-[2]">
                <p className="text-sm leading-relaxed text-ink-muted">{enquiry.message}</p>
              </Cell>
              <Cell label="Contact">
                <p className="figure text-xs text-ink">{enquiry.phone || '—'}</p>
              </Cell>
              <Cell label="Received">
                <p className="figure text-xs text-ink-muted">{formatDateTime(enquiry.createdAt)}</p>
              </Cell>
              <Cell label="Status">
                <div className="flex flex-col items-start gap-2">
                  <StatusBadge status={enquiry.status} />
                  <button
                    onClick={() => handleAdvance(enquiry)}
                    className="border border-hairline-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink transition-colors duration-[120ms] hover:bg-parchment-deep"
                  >
                    Mark {NEXT_STATUS[enquiry.status] ?? 'replied'}
                  </button>
                </div>
              </Cell>
            </RegisterRow>
          ))}
        </Register>
      )}
    </RecordPage>
  );
}
