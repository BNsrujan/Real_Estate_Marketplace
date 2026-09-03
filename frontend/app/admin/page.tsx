'use client';

import { useEffect, useState } from 'react';
import { listAllProperties, listAllEnquiries, listUsers } from '@/features/admin/api/admin_api';
import { RecordPage, FigureRow, Figure } from '@/shared/ui/record';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, properties: 0, enquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listUsers({ limit: 1 }),
      listAllProperties({ limit: 1 }),
      listAllEnquiries({ limit: 1 }),
    ])
      .then(([users, properties, enquiries]) => {
        setStats({
          users: users.total,
          properties: properties.total,
          enquiries: enquiries.total,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <RecordPage eyebrow="Registry Office" title="Overview">
      {loading ? (
        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-parchment px-5 py-6">
              <Skeleton className="mb-3 h-3 w-24" />
              <Skeleton className="h-8 w-14" />
            </div>
          ))}
        </div>
      ) : (
        <FigureRow>
          <Figure label="Registered Users" value={stats.users} />
          <Figure label="Properties Filed" value={stats.properties} />
          <Figure label="Enquiries Logged" value={stats.enquiries} accent />
        </FigureRow>
      )}
    </RecordPage>
  );
}
