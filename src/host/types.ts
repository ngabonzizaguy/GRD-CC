import type {
  LmxRes,
  LmxActor,
  SystemConfigResponse,
  SystemConfigUpdate,
} from '@cco/types/admin';

export type LmxPrefsPatchPayload = {
  show_settings_admin_tab: boolean;
  require_admin_self_credentials: boolean;
  feature_verify_codes: boolean;
  feature_system_config: boolean;
  rides_incoming_enabled: boolean;
};

export type LmxChordCfgPayload = {
  ctrlOrMeta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
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

  getDashboardOverrides?: () => Promise<
    LmxRes<{ overrides?: LmxPrefsPatchPayload }>
  >;

  putDashboardOverrides?: (overrides: LmxPrefsPatchPayload) => Promise<LmxRes<unknown>>;

  getShortcut?: () => Promise<LmxRes<{ config?: LmxChordCfgPayload }>>;

  putShortcut?: (config: LmxChordCfgPayload) => Promise<LmxRes<unknown>>;

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
  }) => Promise<
    LmxRes<{ records?: unknown[]; total?: number; page?: number; limit?: number }>
  >;

  approveIdentity?: (
    identityId: string,
    comment?: string
  ) => Promise<LmxRes<{ identity_id: string; status: string }>>;

  rejectIdentity?: (
    identityId: string,
    rejectReason: string
  ) => Promise<LmxRes<{ identity_id: string; status: string; reject_reason?: string }>>;
};

export type LmxBridgeEnv = {
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_API_PREFIX?: string;
  NEXT_PUBLIC_DEMO_MODE?: string;
  NEXT_PUBLIC_GOOGLE_MAPS_KEY?: string;
  NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?: string;
  NODE_ENV?: string;
};

export type LmxBridge = {
  api: LmxBridgeApi;
  env: LmxBridgeEnv;
  getUser: () => LmxActor | null;
};
