'use client';

import { useEffect, useState } from 'react';
import { listUsers, updateUserRole, toggleUserVerified } from '@/features/admin/api/admin_api';
import { RecordPage, Register, RegisterRow, Cell, EmptyRecord } from '@/shared/ui/record';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toastService } from '@/shared/services/toast.service';
import { cn } from '@/lib/utils';
import type { UserProfile, UserRole } from '@/shared/types';

const ROLES: UserRole[] = ['buyer', 'seller', 'agent', 'admin'];
const PAGE_SIZE = 50;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    listUsers({ limit: PAGE_SIZE })
      .then((result) => setUsers(result.data))
      .catch(() => toastService.error('Could not load users'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    setUpdating(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: updated.role } : user)),
      );
      toastService.success(`Role set to ${role}`);
    } catch {
      toastService.error('Could not change the role');
    } finally {
      setUpdating(null);
    }
  }

  async function handleVerify(userId: string, isVerified: boolean) {
    setUpdating(userId);
    try {
      const updated = await toggleUserVerified(userId, isVerified);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isVerified: updated.isVerified } : user,
        ),
      );
    } catch {
      toastService.error('Could not change verification');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <RecordPage eyebrow="Registry Office" title="Users">
      {loading ? (
        <div className="space-y-px border border-hairline bg-hairline">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-parchment px-4 py-5">
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <Register
          columns={['User', 'Role', 'Verified', 'Joined']}
          empty={users.length === 0 ? <EmptyRecord title="No users registered" /> : undefined}
        >
          {users.map((user) => (
            <RegisterRow key={user.id}>
              <Cell label="User" className="sm:flex-[2]">
                <p className="truncate font-medium text-ink">{user.name}</p>
                <p className="figure truncate text-xs text-ink-muted">{user.email}</p>
              </Cell>
              <Cell label="Role">
                <select
                  value={user.role}
                  disabled={updating === user.id}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  className="border border-hairline-strong bg-parchment px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-vermilion disabled:opacity-50"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Cell>
              <Cell label="Verified">
                <button
                  disabled={updating === user.id}
                  onClick={() => handleVerify(user.id, !user.isVerified)}
                  className={cn(
                    'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-[120ms] disabled:opacity-50',
                    user.isVerified
                      ? 'border-survey/40 bg-survey/8 text-survey'
                      : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink',
                  )}
                >
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </button>
              </Cell>
              <Cell label="Joined">
                <p className="figure text-xs text-ink-muted">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
                </p>
              </Cell>
            </RegisterRow>
          ))}
        </Register>
      )}
    </RecordPage>
  );
}
