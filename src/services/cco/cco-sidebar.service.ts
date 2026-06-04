import {
  getAdminNavConfig,
  readAdminNavStorageOverride,
  saveAdminNavConfigToStorage,
  type AdminNavStorageOverride,
  type NavItemConfig,
} from '@cco/config/admin-nav-config';
import { recordCcoActivity } from '@cco/services/cco/cco-activity-log';
import { hydrateNavFromServer, syncNavToServer } from '@cco/services/cco/cco-nav-sync';
import type { CcoServiceResult } from '@cco/services/cco/types';

function loadOverride(): AdminNavStorageOverride {
  return readAdminNavStorageOverride() ?? { items: {}, order: [] };
}

async function persistOverride(override: AdminNavStorageOverride): Promise<void> {
  saveAdminNavConfigToStorage(override);
  await syncNavToServer(override);
}

export async function loadNavFromServer(): Promise<CcoServiceResult<NavItemConfig[]>> {
  await hydrateNavFromServer();
  return getNavItems();
}

export function getNavItems(): CcoServiceResult<NavItemConfig[]> {
  return { ok: true, data: getAdminNavConfig() };
}

export function updateNavItem(
  id: string,
  patch: Partial<Pick<NavItemConfig, 'label' | 'href' | 'visible' | 'order'>>
): CcoServiceResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const target = current.find((item) => item.id === id);
  if (!target) {
    return { ok: false, code: 'not_found', message: `Nav item "${id}" not found` };
  }

  const override = loadOverride();
  override.items = override.items ?? {};
  override.items[id] = { ...override.items[id], ...patch };
  void persistOverride(override);

  recordCcoActivity('cco.sidebar.update', { detail: `Updated nav item "${id}"`, id, ...patch });

  return getNavItems();
}

export function reorderNavItems(orderedIds: string[]): CcoServiceResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const knownIds = new Set(current.map((item) => item.id));
  const validOrder = orderedIds.filter((id) => knownIds.has(id));

  const override = loadOverride();
  override.order = validOrder;
  void persistOverride(override);

  recordCcoActivity('cco.sidebar.reorder', {
    detail: `Reordered ${validOrder.length} nav items`,
    order: validOrder,
  });

  return getNavItems();
}

export function toggleNavItemVisibility(id: string): CcoServiceResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const target = current.find((item) => item.id === id);
  if (!target) {
    return { ok: false, code: 'not_found', message: `Nav item "${id}" not found` };
  }

  const nextVisible = !(target.visible ?? true);
  return updateNavItem(id, { visible: nextVisible });
}

export function resetNavConfig(): CcoServiceResult<NavItemConfig[]> {
  void persistOverride({ items: {}, order: [] });
  recordCcoActivity('cco.sidebar.reset', { detail: 'Reset nav config to defaults' });
  return getNavItems();
}

export type CcoSidebarNavItem = NavItemConfig;

/** Sync list for sidebar panel mount. */
export function getSidebarNav(): CcoSidebarNavItem[] {
  const res = getNavItems();
  return res.ok ? res.data : [];
}

/** Persist order and visibility from panel state. */
export async function saveSidebarNav(
  items: CcoSidebarNavItem[]
): Promise<CcoServiceResult<CcoSidebarNavItem[]>> {
  const orderRes = reorderNavItems(items.map((i) => i.id));
  if (!orderRes.ok) return orderRes;

  for (const item of items) {
    const patchRes = updateNavItem(item.id, {
      visible: item.visible ?? true,
      label: item.label,
    });
    if (!patchRes.ok) return patchRes;
  }

  return getNavItems();
}
