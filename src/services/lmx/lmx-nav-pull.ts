import {
  readAdminNavStorageOverride,
  saveAdminNavConfigToStorage,
  type AdminNavStorageOverride,
} from '@cco/config/admin-nav-config';
import { readLmxBridge } from '@cco/host/registry';
import { mapLmxRes, type LmxResult } from '@cco/services/lmx/types';

export async function pullLmxNav(): Promise<boolean> {
  const getNav = readLmxBridge().api.getNavigation;
  if (!getNav) return false;
  try {
    const res = await getNav();
    const mapped = mapLmxRes(res);
    if (!mapped.ok || !mapped.data.override) return false;
    const override = mapped.data.override as AdminNavStorageOverride;
    saveAdminNavConfigToStorage(override);
    return true;
  } catch {
    return false;
  }
}

export async function syncNavToServer(
  override: AdminNavStorageOverride
): Promise<LmxResult<unknown>> {
  const putNav = readLmxBridge().api.putNavigation;
  if (!putNav) {
    return { ok: false, code: 'no_api', message: 'Navigation API not configured on host' };
  }
  try {
    const res = await putNav(override);
    return mapLmxRes(res);
  } catch (e) {
    return { ok: false, code: 'client_error', message: e instanceof Error ? e.message : 'Sync failed' };
  }
}

export function getLocalNavOverride(): AdminNavStorageOverride {
  return readAdminNavStorageOverride() ?? { items: {}, order: [] };
}
