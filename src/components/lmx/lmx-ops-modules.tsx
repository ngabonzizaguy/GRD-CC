'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Car,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import {
  CCO_OPS_MODULE_IDS,
  type NavItemConfig,
  type CcoOpsModuleId,
} from '@cco/config/admin-nav-config';
import {
  getNavItems,
  loadNavFromServer,
  reorderNavItems,
  toggleNavItemVisibility,
  updateNavItem,
} from '@cco/services/lmx/lmx-s5';
import {
  getDashboardOverrides,
  updateDashboardOverrides,
} from '@cco/services/lmx/lmx-s2';
import { toast } from 'sonner';

const MODULE_META: Record<
  CcoOpsModuleId,
  { title: string; description: string; icon: LucideIcon }
> = {
  rides: {
    title: 'Rides',
    description: 'Incoming ride queue and trip management in the main admin.',
    icon: Car,
  },
  drivers: {
    title: 'Drivers',
    description: 'Driver roster, status, and verification.',
    icon: Users,
  },
  vehicles: {
    title: 'Vehicles',
    description: 'Fleet records linked to drivers.',
    icon: Truck,
  },
  'kyc-reviews': {
    title: 'KYC Reviews',
    description: 'Approve or reject identity documents on the Identities page.',
    icon: ShieldCheck,
  },
};

export function LmxOpsModules() {
  const [items, setItems] = useState<NavItemConfig[]>([]);
  const [ridesIncoming, setRidesIncoming] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const res = getNavItems();
    if (res.ok) setItems(res.data);
    const prefs = getDashboardOverrides();
    if (prefs.ok) setRidesIncoming(prefs.data.ridesIncomingEnabled);
  };

  useEffect(() => {
    (async () => {
      await loadNavFromServer();
      refresh();
      setLoading(false);
    })();
  }, []);

  const opsItems = CCO_OPS_MODULE_IDS.map((id) => items.find((i) => i.id === id)).filter(
    (i): i is NavItemConfig => !!i
  );

  const moveOps = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= opsItems.length) return;
    const orderedIds = items.map((i) => i.id);
    const a = opsItems[index].id;
    const b = opsItems[next].id;
    const ai = orderedIds.indexOf(a);
    const bi = orderedIds.indexOf(b);
    [orderedIds[ai], orderedIds[bi]] = [orderedIds[bi], orderedIds[ai]];
    setBusy(true);
    const res = reorderNavItems(orderedIds);
    if (res.ok) {
      setItems(res.data);
      toast.success('Order updated');
    } else {
      toast.error(res.message);
    }
    setBusy(false);
  };

  const toggleVisible = (id: string) => {
    setBusy(true);
    const res = toggleNavItemVisibility(id);
    if (res.ok) setItems(res.data);
    else toast.error(res.message);
    setBusy(false);
  };

  const patchItem = (id: string, patch: Partial<Pick<NavItemConfig, 'label' | 'href'>>) => {
    setBusy(true);
    const res = updateNavItem(id, patch);
    if (res.ok) {
      setItems(res.data);
      toast.success('Updated');
    } else {
      toast.error(res.message);
      refresh();
    }
    setBusy(false);
  };

  const toggleRidesIncoming = async (enabled: boolean) => {
    setBusy(true);
    const res = await updateDashboardOverrides({ ridesIncomingEnabled: enabled });
    if (res.ok) {
      setRidesIncoming(res.data.ridesIncomingEnabled);
      toast.success(enabled ? 'Incoming rides enabled' : 'Incoming rides paused');
    } else {
      toast.error(res.message);
    }
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--lmx-mute)' }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading operations modules…
      </div>
    );
  }

  return (
    <LmxBlock
      title="Operations modules"
      description="Show, hide, rename, and reorder Rides, Drivers, Vehicles, and KYC in the main admin sidebar"
      icon={Car}
      action={busy ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--lmx-mute)' }} /> : null}
    >
      <ul className="space-y-3">
        {opsItems.map((item, index) => {
          const meta = MODULE_META[item.id as CcoOpsModuleId];
          const Icon = meta?.icon ?? Car;
          const visible = item.visible !== false;
          return (
            <li
              key={item.id}
              className="rounded-lg border px-3 py-3"
              style={{
                borderColor: 'var(--lmx-hairline)',
                background: visible ? 'var(--lmx-canvas-soft)' : 'transparent',
                opacity: visible ? 1 : 0.6,
              }}
            >
              <div className="flex flex-wrap items-start gap-3">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
                  style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-body)' }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
                    {meta?.title ?? item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--lmx-mute)' }}>
                    {meta?.description}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block">
                      <span
                        className="mb-1 block text-[11px] font-medium uppercase tracking-wide"
                        style={{ color: 'var(--lmx-mute)' }}
                      >
                        Sidebar label
                      </span>
                      <input
                        type="text"
                        className="lmx-input w-full"
                        value={item.label}
                        disabled={busy}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, label: e.target.value } : row
                            )
                          )
                        }
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== item.label) patchItem(item.id, { label: v });
                          else refresh();
                        }}
                      />
                    </label>
                    <label className="block">
                      <span
                        className="mb-1 block text-[11px] font-medium uppercase tracking-wide"
                        style={{ color: 'var(--lmx-mute)' }}
                      >
                        Path
                      </span>
                      <input
                        type="text"
                        className="lmx-input lmx-mono w-full"
                        value={item.href}
                        disabled={busy}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, href: e.target.value } : row
                            )
                          )
                        }
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v.startsWith('/') && v !== item.href) patchItem(item.id, { href: v });
                          else if (!v.startsWith('/')) toast.error('Path must start with /');
                          else refresh();
                        }}
                      />
                    </label>
                  </div>
                  {item.id === 'rides' ? (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
                      style={{ borderColor: 'var(--lmx-hairline)' }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
                          Accept incoming rides
                        </p>
                        <p className="text-xs" style={{ color: 'var(--lmx-mute)' }}>
                          When off, the Rides page shows a paused state (platform intake).
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={ridesIncoming}
                        className="lmx-switch"
                        data-checked={ridesIncoming}
                        disabled={busy}
                        onClick={() => toggleRidesIncoming(!ridesIncoming)}
                      />
                    </div>
                  ) : null}
                  {item.id === 'kyc-reviews' ? (
                    <p className="text-xs" style={{ color: 'var(--lmx-body)' }}>
                      Approve and reject actions remain on{' '}
                      <span className="lmx-mono">{item.href}</span> in the main admin.
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="lmx-btn-ghost px-2 py-1"
                    onClick={() => moveOps(index, -1)}
                    disabled={index === 0 || busy}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="lmx-btn-ghost px-2 py-1"
                    onClick={() => moveOps(index, 1)}
                    disabled={index === opsItems.length - 1 || busy}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="lmx-btn-ghost px-2 py-1"
                    onClick={() => toggleVisible(item.id)}
                    disabled={busy}
                    aria-label={visible ? 'Hide from sidebar' : 'Show in sidebar'}
                  >
                    {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </LmxBlock>
  );
}
