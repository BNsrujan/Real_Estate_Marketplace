'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, getDashboardEnquiries } from '@/features/dashboard/api/dashboard_api';
import { RecordPage, FigureRow, Figure, Register, RegisterRow, Cell, EmptyRecord } from '@/shared/ui/record';
import { StatusBadge } from '@/shared/components/common/status_badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { DashboardStats, EnquiryWithProperty } from '@/shared/types';

const RECENT_LIMIT = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getDashboardEnquiries()])
      .then(([statsResult, enquiryResult]) => {
        setStats(statsResult);
        setEnquiries(enquiryResult.slice(0, RECENT_LIMIT));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <RecordPage eyebrow="Seller Register" title="Overview">
      {loading || !stats ? (
        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-parchment px-5 py-6">
              <Skeleton className="mb-3 h-3 w-20" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <FigureRow>
          <Figure label="Active Listings" value={stats.activeCount} />
          <Figure label="Sold" value={stats.soldCount} />
          <Figure label="Rented" value={stats.rentedCount} />
          <Figure label="Enquiries" value={stats.enquiryCount} accent />
        </FigureRow>
      )}

      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between border-b border-hairline pb-3">
          <h2 className="display text-xl text-ink">Recent Enquiries</h2>
          <Link
            href="/dashboard/enquiries"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-vermilion hover:underline"
          >
            View all
          </Link>
        </div>

        <Register
          columns={['Property', 'Message', 'Received', 'Status']}
          empty={
            !loading && enquiries.length === 0 ? (
              <EmptyRecord
                title="No enquiries yet"
                hint="When a buyer enquires on one of your listings it will be recorded here."
              />
            ) : undefined
          }
        >
          {enquiries.map((enquiry) => (
            <RegisterRow key={enquiry.id}>
              <Cell label="Property">
                <p className="truncate text-sm text-ink">{enquiry.propertyTitle}</p>
              </Cell>
              <Cell label="Message">
                <p className="truncate text-sm text-ink-muted">{enquiry.message}</p>
              </Cell>
              <Cell label="Received">
                <p className="figure text-xs text-ink-muted">{formatDate(enquiry.createdAt)}</p>
              </Cell>
              <Cell label="Status">
                <StatusBadge status={enquiry.status} />
              </Cell>
            </RegisterRow>
          ))}
        </Register>
      </section>
    </RecordPage>
  );
}
