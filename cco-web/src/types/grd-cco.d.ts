declare module '@grd/cco' {
  import type { ReactNode } from 'react';

  export type LmxPaneId =
    | 'p0'
    | 'p1'
    | 'p2'
    | 'p3'
    | 'p4'
    | 'p5'
    | 'p6'
    | 'p7'
    | 'p8'
    | 'p9';

  export type LmxChordCfg = {
    ctrlOrMeta: boolean;
    shift: boolean;
    alt: boolean;
    key: string;
  };

  export type LmxActor = {
    admin_id?: string;
    role?: string;
    email?: string;
    username?: string;
    full_name?: string;
  };

  export type LmxRes<T = unknown> = {
    code: string;
    msg: string;
    data: T;
  };

  export type SystemConfigResponse = Record<string, unknown>;
  export type SystemConfigUpdate = Record<string, unknown>;

  export type LmxPrefsApiPayload = {
    show_settings_admin_tab?: boolean;
    require_admin_self_credentials?: boolean;
    feature_verify_codes?: boolean;
    feature_system_config?: boolean;
    rides_incoming_enabled?: boolean;
  };

  export type LmxPrefsPutPayload = {
    show_settings_admin_tab: boolean;
    require_admin_self_credentials: boolean;
    feature_verify_codes: boolean;
    feature_system_config: boolean;
    rides_incoming_enabled: boolean;
  };

  export type LmxEnvRow = {
    key: string;
    label?: string;
    category: string;
    value?: string;
    is_secret?: boolean;
    description?: string;
  };

  export type LmxBridgeApi = {
    getAdmins: (params?: {
      page?: number;
      limit?: number;
      keyword?: string;
      role?: string;
      status?: string;
    }) => Promise<LmxRes<{ list?: unknown[]; total?: number }>>;
    updateAdminRolePermissions: (
      adminId: string,
      role: string,
      permissions: string[]
    ) => Promise<LmxRes<unknown>>;
    createAdmin: (params: {
      username: string;
      email: string;
      password: string;
      role: string;
      permissions?: string[];
      department?: string;
      job_title?: string;
    }) => Promise<LmxRes<unknown>>;
    getSystemConfig: () => Promise<LmxRes<SystemConfigResponse>>;
    updateSystemConfig: (config: SystemConfigUpdate) => Promise<LmxRes<SystemConfigResponse>>;
    getAdminInfo?: () => Promise<LmxRes<unknown>>;
    listLogs?: (params?: {
      page?: number;
      limit?: number;
      keyword?: string;
      level?: string;
      source?: string;
    }) => Promise<LmxRes<{ list?: unknown[]; total?: number }>>;
    searchActivity?: (params?: {
      page?: number;
      limit?: number;
      keyword?: string;
    }) => Promise<LmxRes<{ list?: unknown[]; total?: number }>>;
    appendActivity?: (params: {
      action: string;
      detail?: string;
      target?: string;
      level?: string;
      source?: string;
    }) => Promise<LmxRes<unknown>>;
    getNavigation?: () => Promise<
      LmxRes<{ override?: { items?: Record<string, unknown>; order?: string[] } }>
    >;
    putNavigation?: (override: {
      items?: Record<string, unknown>;
      order?: string[];
    }) => Promise<LmxRes<unknown>>;
    getDashboardOverrides?: () => Promise<LmxRes<{ overrides?: LmxPrefsApiPayload }>>;
    putDashboardOverrides?: (overrides: LmxPrefsPutPayload) => Promise<LmxRes<unknown>>;
    getShortcut?: () => Promise<LmxRes<{ config?: LmxChordCfg }>>;
    putShortcut?: (config: LmxChordCfg) => Promise<LmxRes<unknown>>;
    getSecrets?: () => Promise<
      LmxRes<{
        secrets?: Array<{ key: string; label: string; configured: boolean; fingerprint?: string }>;
      }>
    >;
    putSecrets?: (updates: Record<string, string>) => Promise<LmxRes<unknown>>;
    getEnvRegistry?: () => Promise<LmxRes<{ entries?: LmxEnvRow[] }>>;
    putEnvRegistry?: (entries: LmxEnvRow[]) => Promise<LmxRes<unknown>>;
    getIPAllowlist?: () => Promise<LmxRes<{ allowlist?: string[]; enabled?: boolean }>>;
    putIPAllowlist?: (body: { allowlist: string[]; enabled?: boolean }) => Promise<LmxRes<unknown>>;
    getConnectionSettings?: () => Promise<
      LmxRes<{ flags?: { maintenance_bypass?: boolean; strict_api_tls?: boolean } }>
    >;
    putConnectionSettings?: (flags: {
      maintenance_bypass: boolean;
      strict_api_tls: boolean;
    }) => Promise<LmxRes<unknown>>;
    getIntegrationsHealth?: () => Promise<
      LmxRes<{
        status?: string;
        checks?: Array<{ name: string; status: string; message?: string; latency_ms?: number }>;
        checked_at?: number;
      }>
    >;
    listIdentities?: (params?: {
      status?: 'pending' | 'approved' | 'rejected' | 'expired';
      page?: number;
      limit?: number;
    }) => Promise<LmxRes<{ records?: unknown[]; total?: number }>>;
    approveIdentity?: (
      identityId: string,
      comment?: string
    ) => Promise<LmxRes<{ identity_id: string; status: string }>>;
    rejectIdentity?: (
      identityId: string,
      rejectReason: string
    ) => Promise<LmxRes<{ identity_id: string; status: string }>>;
  };

  export type LmxBridgeEnv = Record<string, string | undefined>;

  export type LmxBridge = {
    api: LmxBridgeApi;
    env: LmxBridgeEnv;
    getUser: () => LmxActor | null;
  };

  export function LmxBindProvider(props: {
    host: LmxBridge;
    user?: LmxActor | null;
    children: ReactNode;
  }): React.JSX.Element;

  export function useLmxActor(): LmxActor | null;
  export function useIsSuperAdmin(): boolean;

  export function LmxPortal(props: { fontClassName?: string }): React.JSX.Element | null;
  export function LmxPanePolicy(props: { embedded?: boolean }): React.JSX.Element;

  export function canOpenLmx(): boolean;
  export function isLmxChord(e: KeyboardEvent): boolean;

  export const LMX_NAV_K: string;
  export function getAdminNavConfig(): NavItemConfig[];
  export function getShowSettingsAdminTab(): boolean;
  export function getRequireAdminSelfCredentials(): boolean;
  export function getFeatureVerifyCodes(): boolean;
  export function getFeatureSystemConfig(): boolean;
  export function getRidesIncomingEnabled(): boolean;
  export const CCO_OPS_MODULE_IDS: readonly ['rides', 'drivers', 'vehicles', 'kyc-reviews'];
  export type CcoOpsModuleId = (typeof CCO_OPS_MODULE_IDS)[number];
  export function pullLmxNav(): Promise<boolean>;
  export function loadNavFromServer(): Promise<
    { ok: true; data: NavItemConfig[] } | { ok: false; code: string; message: string }
  >;
  export function pullLmxRemote(): Promise<boolean>;
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

  type LmxStoreState = {
    isOpen: boolean;
    activeFeature: LmxPaneId;
    mobileNavOpen: boolean;
    open: (feature?: LmxPaneId) => void;
    close: () => void;
    setFeature: (feature: LmxPaneId) => void;
    setMobileNavOpen: (open: boolean) => void;
    toggleMobileNav: () => void;
  };

  interface LmxStoreApi {
    getState(): LmxStoreState;
  }

  export const useLmxStore: (<T>(selector: (state: LmxStoreState) => T) => T) & LmxStoreApi;
}

declare module '@grd/cco/theme.css' {}
