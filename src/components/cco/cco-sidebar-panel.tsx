'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutList, Loader2 } from 'lucide-react';
import type { NavItemConfig } from '@cco/config/admin-nav-config';
import { CcoSection } from '@cco/components/cco/cco-section';
import {
  getNavItems,
  loadNavFromServer,
  reorderNavItems,
  toggleNavItemVisibility,
  updateNavItem,
} from '@cco/services/cco/cco-sidebar.service';
import { toast } from 'sonner';

export function CcoSidebarPanel() {
  const [items, setItems] = useState<NavItemConfig[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    const res = getNavItems();
    if (res.ok) setItems(res.data);
  };

  useEffect(() => {
    (async () => {
      await loadNavFromServer();
      refresh();
    })();
  }, []);

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const orderedIds = [...items];
    [orderedIds[index], orderedIds[next]] = [orderedIds[next], orderedIds[index]];
    setBusy(true);
    const res = reorderNavItems(orderedIds.map((i) => i.id));
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
    if (res.ok) {
      setItems(res.data);
    } else {
      toast.error(res.message);
    }
    setBusy(false);
  };

  const patchItem = (
    id: string,
    patch: Partial<Pick<NavItemConfig, 'label' | 'href'>>
  ) => {
    const trimmedLabel = patch.label?.trim();
    const trimmedHref = patch.href?.trim();
    if (trimmedLabel !== undefined && !trimmedLabel) {
      toast.error('Label cannot be empty');
      return;
    }
    if (trimmedHref !== undefined && !trimmedHref.startsWith('/')) {
      toast.error('Path must start with /');
      return;
    }

    setBusy(true);
    const res = updateNavItem(id, {
      ...(trimmedLabel !== undefined ? { label: trimmedLabel } : {}),
      ...(trimmedHref !== undefined ? { href: trimmedHref } : {}),
    });
    if (res.ok) {
      setItems(res.data);
      toast.success('Nav item updated');
    } else {
      toast.error(res.message);
      refresh();
    }
    setBusy(false);
  };

  const updateLocal = (id: string, field: 'label' | 'href', value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Sidebar menu
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Edit labels and paths, reorder, and show/hide main admin nav items. Changes apply to the
          live sidebar immediately (local until backend menu API).
        </p>
      </div>

      <CcoSection
        title="Navigation items"
        description="Edit label and path; arrows reorder; eye toggles visibility"
        icon={LayoutList}
        action={busy ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--cco-mute)' }} /> : null}
      >
        <div className="cco-nav-editor-list">
          <ul className="space-y-3">
            {items.map((item, index) => {
              const visible = item.visible !== false;
              return (
                <li
                  key={item.id}
                  className="rounded-lg border px-3 py-3"
                  style={{
                    borderColor: 'var(--cco-hairline)',
                    background: visible ? 'var(--cco-canvas-soft)' : 'transparent',
                    opacity: visible ? 1 : 0.55,
                  }}
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--cco-mute)' }}>
                          Label
                        </span>
                        <input
                          type="text"
                          className="cco-input w-full"
                          value={item.label}
                          disabled={busy}
                          onChange={(e) => updateLocal(item.id, 'label', e.target.value)}
                          onBlur={(e) => {
                            const prev = e.currentTarget.dataset.saved ?? item.label;
                            const v = e.target.value.trim();
                            if (v && v !== prev) patchItem(item.id, { label: v });
                            else if (!v) refresh();
                          }}
                          onFocus={(e) => {
                            e.currentTarget.dataset.saved = item.label;
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--cco-mute)' }}>
                          Path
                        </span>
                        <input
                          type="text"
                          className="cco-input cco-mono w-full"
                          value={item.href}
                          disabled={busy}
                          placeholder="/example"
                          onChange={(e) => updateLocal(item.id, 'href', e.target.value)}
                          onBlur={(e) => {
                            const prev = e.currentTarget.dataset.saved ?? item.href;
                            const v = e.target.value.trim();
                            if (v && v !== prev) patchItem(item.id, { href: v });
                            else if (!v) refresh();
                          }}
                          onFocus={(e) => {
                            e.currentTarget.dataset.saved = item.href;
                          }}
                        />
                      </label>
                      <p className="text-xs" style={{ color: 'var(--cco-mute)' }}>
                        {item.sectionLabel ?? 'Bottom'} · id: <span className="cco-mono">{item.id}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 pt-6">
                      <button
                        type="button"
                        className="cco-btn-ghost px-2 py-1"
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || busy}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="cco-btn-ghost px-2 py-1"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1 || busy}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="cco-btn-ghost px-2 py-1"
                        onClick={() => toggleVisible(item.id)}
                        disabled={busy}
                        aria-label={visible ? 'Hide' : 'Show'}
                      >
                        {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CcoSection>
    </div>
  );
}
