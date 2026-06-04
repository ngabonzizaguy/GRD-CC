import {
  getAdminNavConfig,
  readAdminNavStorageOverride,
  saveAdminNavConfigToStorage,
  type AdminNavStorageOverride,
  type NavItemConfig,
} from '@cco/config/admin-nav-config';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { pullLmxNav, syncNavToServer } from '@cco/services/lmx/lmx-nav-pull';
import type { LmxResult } from '@cco/services/lmx/types';

function loadOverride(): AdminNavStorageOverride {
  return readAdminNavStorageOverride() ?? { items: {}, order: [] };
}

async function persistOverride(override: AdminNavStorageOverride): Promise<void> {
  saveAdminNavConfigToStorage(override);
  await syncNavToServer(override);
}

export async function loadNavFromServer(): Promise<LmxResult<NavItemConfig[]>> {
  await pullLmxNav();
  return getNavItems();
}

export function getNavItems(): LmxResult<NavItemConfig[]> {
  return { ok: true, data: getAdminNavConfig() };
}

export function updateNavItem(
  id: string,
  patch: Partial<Pick<NavItemConfig, 'label' | 'href' | 'visible' | 'order'>>
): LmxResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const target = current.find((item) => item.id === id);
  if (!target) {
    return { ok: false, code: 'not_found', message: `Nav item "${id}" not found` };
  }

  const override = loadOverride();
  override.items = override.items ?? {};
  override.items[id] = { ...override.items[id], ...patch };
  void persistOverride(override);

  pushLmxAudit('lmx.sidebar.update', { detail: `Updated nav item "${id}"`, id, ...patch });

  return getNavItems();
}

export function reorderNavItems(orderedIds: string[]): LmxResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const knownIds = new Set(current.map((item) => item.id));
  const validOrder = orderedIds.filter((id) => knownIds.has(id));

  const override = loadOverride();
  override.order = validOrder;
  void persistOverride(override);

  pushLmxAudit('lmx.sidebar.reorder', {
    detail: `Reordered ${validOrder.length} nav items`,
    order: validOrder,
  });

  return getNavItems();
}

export function toggleNavItemVisibility(id: string): LmxResult<NavItemConfig[]> {
  const current = getAdminNavConfig();
  const target = current.find((item) => item.id === id);
  if (!target) {
    return { ok: false, code: 'not_found', message: `Nav item "${id}" not found` };
  }

  const nextVisible = !(target.visible ?? true);
  return updateNavItem(id, { visible: nextVisible });
}

export function resetNavConfig(): LmxResult<NavItemConfig[]> {
  void persistOverride({ items: {}, order: [] });
  pushLmxAudit('lmx.sidebar.reset', { detail: 'Reset nav config to defaults' });
  return getNavItems();
}

export type LmxRailNavItem = NavItemConfig;


export function getSidebarNav(): LmxRailNavItem[] {
  const res = getNavItems();
  return res.ok ? res.data : [];
}


export async function saveSidebarNav(
  items: LmxRailNavItem[]
): Promise<LmxResult<LmxRailNavItem[]>> {
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
