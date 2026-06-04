/** @grd/cco — Control Center module for GreenRide admin */

export { CcoHostProvider, useCcoUser, useIsSuperAdmin } from '@cco/host/context';
export { registerCcoHost, getCcoHost } from '@cco/host/registry';
export { canAccessCco } from '@cco/host/access';
export type { CcoHostAdapter, CcoHostApi, CcoHostEnv } from '@cco/host/types';

export { CcoOverlay } from '@cco/components/cco/cco-overlay';
export { CcoShell } from '@cco/components/cco/cco-shell';
export { CcoRbacPanel } from '@cco/components/cco/cco-rbac-panel';
export { CcoContentPanel } from '@cco/components/cco/cco-content-panel';

export { useCcoStore } from '@cco/stores/cco-store';
export type { CcoFeatureId } from '@cco/stores/cco-store';

export { isCcoShortcut, getCcoShortcutConfig, getDefaultShortcut } from '@cco/config/cco-shortcut-config';
export type { CcoShortcutConfig } from '@cco/config/cco-shortcut-config';

export {
  ADMIN_NAV_STORAGE_KEY,
  getAdminNavConfig,
  getDefaultAdminNavConfig,
  readAdminNavStorageOverride,
  saveAdminNavConfigToStorage,
} from '@cco/config/admin-nav-config';
export type { AdminNavStorageOverride, NavItemConfig } from '@cco/config/admin-nav-config';

export * from '@cco/services/cco';
export { hydrateNavFromServer, syncNavToServer } from '@cco/services/cco/cco-nav-sync';
export { loadNavFromServer } from '@cco/services/cco/cco-sidebar.service';
