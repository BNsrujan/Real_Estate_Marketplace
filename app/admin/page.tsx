'use client';

import { useEffect, useState } from 'react';
import { listAllProperties, listAllEnquiries, listUsers } from '@/features/admin/api/admin_api';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, properties: 0, enquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listUsers({ limit: 1 }),
      listAllProperties({ limit: 1 }),
      listAllEnquiries({ limit: 1 }),
    ]).then(([u, p, e]) => {
      setStats({ users: u.total, properties: p.total, enquiries: e.total });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users',      value: stats.users },
    { label: 'Total Properties', value: stats.properties },
    { label: 'Total Enquiries',  value: stats.enquiries },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-white">{value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
