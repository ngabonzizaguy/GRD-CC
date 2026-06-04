import {
  readAdminNavStorageOverride,
  saveAdminNavConfigToStorage,
  type AdminNavStorageOverride,
} from '@cco/config/admin-nav-config';
import { getCcoHost } from '@cco/host/registry';
import { mapCcoApiResponse, type CcoServiceResult } from '@cco/services/cco/types';

export async function hydrateNavFromServer(): Promise<boolean> {
  const getNav = getCcoHost().api.getNavigation;
  if (!getNav) return false;
  try {
    const res = await getNav();
    const mapped = mapCcoApiResponse(res);
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
): Promise<CcoServiceResult<unknown>> {
  const putNav = getCcoHost().api.putNavigation;
  if (!putNav) {
    return { ok: false, code: 'no_api', message: 'Navigation API not configured on host' };
  }
  try {
    const res = await putNav(override);
    return mapCcoApiResponse(res);
  } catch (e) {
    return { ok: false, code: 'client_error', message: e instanceof Error ? e.message : 'Sync failed' };
  }
}

export function getLocalNavOverride(): AdminNavStorageOverride {
  return readAdminNavStorageOverride() ?? { items: {}, order: [] };
}
