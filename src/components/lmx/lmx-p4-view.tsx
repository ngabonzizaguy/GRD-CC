'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Plus, Save, Users } from 'lucide-react';
import { useLmxActor } from '@cco/host/context';
import { ADMIN_ROLES, PERMISSION_OPTIONS } from '@cco/config/permissions';
import type { AdminRole } from '@cco/types/admin';
import {
  createAdmin,
  listAdmins,
  updateAdminRolePermissions,
  type LmxActorRow,
} from '@cco/services/lmx/lmx-s4';
import { toast } from 'sonner';

const DOMAIN = '@greenrideafrica.com';

interface LmxPanePolicyProps {
  
  embedded?: boolean;
}

export function LmxPanePolicy({ embedded = true }: LmxPanePolicyProps) {
  const currentUser = useLmxActor();

  const [admins, setAdmins] = useState<LmxActorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { role: AdminRole; permissions: string[] }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<AdminRole>('support');
  const [createPermissions, setCreatePermissions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    const result = await listAdmins({ page: 1, limit: 50 });
    if (result.ok) {
      setAdmins(result.data.list);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if ((currentUser?.role as string) !== 'super_admin') return;
    loadAdmins();
  }, [currentUser]);

  const getEdit = (adminId: string): { role: AdminRole; permissions: string[] } =>
    edits[adminId] ?? {
      role: (admins.find((a) => a.admin_id === adminId)?.role as AdminRole) ?? 'support',
      permissions: admins.find((a) => a.admin_id === adminId)?.permissions ?? [],
    };

  const setEdit = (adminId: string, upd: Partial<{ role: AdminRole; permissions: string[] }>) => {
    const current = getEdit(adminId);
    setEdits((prev) => ({ ...prev, [adminId]: { ...current, ...upd } }));
  };

  const togglePermission = (adminId: string, permission: string) => {
    const { permissions } = getEdit(adminId);
    const next = permissions.includes(permission)
      ? permissions.filter((p) => p !== permission)
      : [...permissions, permission];
    setEdit(adminId, { permissions: next });
  };

  const saveAdmin = async (adminId: string) => {
    const { role, permissions } = getEdit(adminId);
    setSaving(adminId);
    setError(null);
    const result = await updateAdminRolePermissions(adminId, role, permissions);
    if (result.ok) {
      setAdmins((prev) =>
        prev.map((a) => (a.admin_id !== adminId ? a : { ...a, role, permissions }))
      );
      setEdits((prev) => {
        const next = { ...prev };
        delete next[adminId];
        return next;
      });
      toast.success('Saved');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setSaving(null);
  };

  const isCurrentUser = (adminId: string): boolean =>
    Boolean(currentUser && (currentUser as { admin_id?: string }).admin_id === adminId);

  const handleCreateAdmin = async () => {
    const email = createEmail.trim().toLowerCase();
    if (!email.endsWith(DOMAIN)) {
      toast.error(`Email must end with ${DOMAIN}`);
      return;
    }
    const username = createUsername.trim() || email.replace(DOMAIN, '');
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if ((createPassword || '').length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setCreating(true);
    setError(null);
    const result = await createAdmin({
      username,
      email,
      password: createPassword,
      role: createRole,
      permissions: createPermissions.length > 0 ? createPermissions : undefined,
    });
    if (result.ok) {
      toast.success('Admin created');
      setCreateUsername('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('support');
      setCreatePermissions([]);
      await loadAdmins();
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
            Access Control policy
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
            Actor roles and permission matrix.
          </p>
        </div>
      )}

      <section className="lmx-card overflow-hidden">
        <header className="border-b px-6 py-4" style={{ borderColor: 'var(--lmx-hairline)' }}>
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--lmx-ink)' }}>
            <KeyRound className="h-5 w-5" />
            Create admin
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
            Email must be {DOMAIN}.
          </p>
        </header>
        <div className="space-y-4 p-6">
          {error && (
            <p className="text-sm" style={{ color: 'var(--lmx-error)' }}>
              {error}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LmxField label="Username">
              <input
                className="lmx-input"
                placeholder="jane"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
              />
            </LmxField>
            <LmxField label="Email">
              <input
                className="lmx-input"
                type="email"
                placeholder={`name${DOMAIN}`}
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </LmxField>
            <LmxField label="Password">
              <input
                className="lmx-input"
                type="password"
                placeholder="••••••••"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </LmxField>
            <LmxField label="Role">
              <select
                className="lmx-input"
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as AdminRole)}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </LmxField>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PERMISSION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
                style={{ color: 'var(--lmx-body)' }}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border"
                  style={{ borderColor: 'var(--lmx-hairline-strong)' }}
                  checked={createPermissions.includes(opt.value)}
                  onChange={() => {
                    setCreatePermissions((prev) =>
                      prev.includes(opt.value)
                        ? prev.filter((p) => p !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="lmx-btn-primary inline-flex items-center gap-2"
            onClick={handleCreateAdmin}
            disabled={creating}
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {creating ? 'Creating…' : 'Create admin'}
          </button>
        </div>
      </section>

      <section className="lmx-card overflow-hidden">
        <header className="border-b px-6 py-4" style={{ borderColor: 'var(--lmx-hairline)' }}>
          <div className="flex items-center gap-2 font-medium" style={{ color: 'var(--lmx-ink)' }}>
            <Users className="h-5 w-5" />
            Admins
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
            Edit role and permissions. Changes take effect immediately.
          </p>
        </header>
        <div className="p-6">
          {loading ? (
            <div
              className="flex items-center justify-center gap-2 py-8 text-sm"
              style={{ color: 'var(--lmx-mute)' }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading admins…
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => {
                const adminId = admin.admin_id;
                const { role: adminRole, permissions } = getEdit(adminId);
                const isYou = isCurrentUser(adminId);
                return (
                  <div
                    key={adminId}
                    className="rounded-lg border p-4"
                    style={{ borderColor: 'var(--lmx-hairline)', background: 'var(--lmx-canvas-soft)' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--lmx-ink)' }}>
                          {admin.full_name || admin.username || admin.email || adminId}
                          {isYou && (
                            <span className="ml-2 font-normal" style={{ color: 'var(--lmx-mute)' }}>
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--lmx-body)' }}>
                          {admin.email} · {admin.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--lmx-mute)' }}>
                          Role
                        </span>
                        <select
                          className="lmx-input w-[140px]"
                          value={adminRole}
                          onChange={(e) => setEdit(adminId, { role: e.target.value as AdminRole })}
                          disabled={isYou}
                        >
                          {ADMIN_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {!isYou && (
                          <button
                            type="button"
                            className="lmx-btn-primary px-3 py-2"
                            onClick={() => saveAdmin(adminId)}
                            disabled={saving === adminId}
                            aria-label="Save"
                          >
                            {saving === adminId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {PERMISSION_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          style={{ color: 'var(--lmx-body)' }}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border"
                            style={{ borderColor: 'var(--lmx-hairline-strong)' }}
                            checked={permissions.includes(opt.value)}
                            onChange={() => togglePermission(adminId, opt.value)}
                            disabled={isYou}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LmxField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
