/**
 * Shared admin navigation config for main sidebar and CCo sidebar CRUD.
 * Icon names match lucide-react export names (resolved in UI layers).
 */

export const ADMIN_NAV_STORAGE_KEY = 'gr_cco_nav';

export type NavItemConfig = {
  id: string;
  label: string;
  href: string;
  icon: string;
  permission?: string;
  sectionId?: string;
  sectionLabel?: string;
  visible?: boolean;
  order?: number;
};

export type AdminNavStorageOverride = {
  /** Per-item overrides keyed by nav item id */
  items?: Record<
    string,
    Partial<Pick<NavItemConfig, 'label' | 'href' | 'visible' | 'order'>>
  >;
  /** Global display order of item ids (optional) */
  order?: string[];
};

const DEFAULT_ADMIN_NAV_CONFIG: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'LayoutDashboard', sectionId: 'main', sectionLabel: 'Main' },
  { id: 'feedback', label: 'Feedback', href: '/feedback', icon: 'MessageSquare', sectionId: 'main', sectionLabel: 'Main' },
  { id: 'live-map', label: 'Live Map', href: '/map', icon: 'Map', sectionId: 'main', sectionLabel: 'Main' },
  { id: 'drivers', label: 'Drivers', href: '/drivers', icon: 'Car', sectionId: 'operations', sectionLabel: 'Operations' },
  { id: 'shifts', label: 'Shifts', href: '/shifts', icon: 'CalendarClock', sectionId: 'operations', sectionLabel: 'Operations' },
  { id: 'vehicles', label: 'Vehicles', href: '/vehicles', icon: 'Truck', sectionId: 'operations', sectionLabel: 'Operations' },
  { id: 'users', label: 'Users', href: '/users', icon: 'Users', sectionId: 'operations', sectionLabel: 'Operations' },
  { id: 'rides', label: 'Rides', href: '/rides', icon: 'Car', sectionId: 'operations', sectionLabel: 'Operations' },
  { id: 'revenue', label: 'Revenue', href: '/revenue', icon: 'DollarSign', sectionId: 'insights', sectionLabel: 'Insights' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'BarChart3', sectionId: 'insights', sectionLabel: 'Insights' },
  { id: 'promotions', label: 'Promotions', href: '/promotions', icon: 'Tag', sectionId: 'insights', sectionLabel: 'Insights' },
  { id: 'quick-booking', label: 'Quick Booking', href: '/quick-booking', icon: 'Phone', sectionId: 'insights', sectionLabel: 'Insights' },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: 'Bell', sectionId: 'insights', sectionLabel: 'Insights' },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    permission: 'system_config',
    sectionId: 'bottom',
    sectionLabel: '',
  },
  {
    id: 'verify-codes',
    label: 'Generated OTPs',
    href: '/verify-codes',
    icon: 'KeyRound',
    permission: 'verify_codes',
    sectionId: 'bottom',
    sectionLabel: '',
  },
];

function cloneDefaultNav(): NavItemConfig[] {
  return DEFAULT_ADMIN_NAV_CONFIG.map((item, index) => ({
    ...item,
    visible: item.visible ?? true,
    order: item.order ?? index,
  }));
}

function readStorageOverride(): AdminNavStorageOverride | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_NAV_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminNavStorageOverride;
  } catch {
    return null;
  }
}

function applyOverrides(items: NavItemConfig[], override: AdminNavStorageOverride | null): NavItemConfig[] {
  if (!override) return items;

  const merged = items.map((item) => {
    const patch = override.items?.[item.id];
    if (!patch) return item;
    return {
      ...item,
      ...patch,
      visible: patch.visible ?? item.visible ?? true,
    };
  });

  if (override.order?.length) {
    const orderMap = new Map(override.order.map((id, index) => [id, index]));
    return [...merged].sort((a, b) => {
      const aOrder = orderMap.has(a.id) ? orderMap.get(a.id)! : (a.order ?? 999);
      const bOrder = orderMap.has(b.id) ? orderMap.get(b.id)! : (b.order ?? 999);
      return aOrder - bOrder;
    });
  }

  return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Default nav structure merged with CCo localStorage overrides (`gr_cco_nav`). */
export function getAdminNavConfig(): NavItemConfig[] {
  const base = cloneDefaultNav();
  return applyOverrides(base, readStorageOverride());
}

export function saveAdminNavConfigToStorage(override: AdminNavStorageOverride): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_NAV_STORAGE_KEY, JSON.stringify(override));
  window.dispatchEvent(new CustomEvent('host-nav-updated'));
}

export function getDefaultAdminNavConfig(): NavItemConfig[] {
  return cloneDefaultNav();
}

export function readAdminNavStorageOverride(): AdminNavStorageOverride | null {
  return readStorageOverride();
}
