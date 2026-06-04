import type {
  CcoApiResponse,
  CcoUser,
  SystemConfigResponse,
  SystemConfigUpdate,
} from '@cco/types/admin';

export type CcoHostApi = {
  getAdmins: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    role?: string;
    status?: string;
  }) => Promise<CcoApiResponse<{ list?: unknown[]; total?: number }>>;

  updateAdminRolePermissions: (
    adminId: string,
    role: string,
    permissions: string[]
  ) => Promise<CcoApiResponse<unknown>>;

  createAdmin: (params: {
    username: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    job_title?: string;
  }) => Promise<CcoApiResponse<unknown>>;

  getSystemConfig: () => Promise<CcoApiResponse<SystemConfigResponse>>;
  updateSystemConfig: (config: SystemConfigUpdate) => Promise<CcoApiResponse<SystemConfigResponse>>;
  getAdminInfo?: () => Promise<CcoApiResponse<unknown>>;

  listLogs?: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    level?: string;
    source?: string;
  }) => Promise<CcoApiResponse<{ list?: unknown[]; total?: number }>>;

  searchActivity?: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }) => Promise<CcoApiResponse<{ list?: unknown[]; total?: number }>>;

  appendActivity?: (params: {
    action: string;
    detail?: string;
    target?: string;
    level?: string;
    source?: string;
  }) => Promise<CcoApiResponse<unknown>>;

  getNavigation?: () => Promise<
    CcoApiResponse<{ override?: { items?: Record<string, unknown>; order?: string[] } }>
  >;

  putNavigation?: (override: {
    items?: Record<string, unknown>;
    order?: string[];
  }) => Promise<CcoApiResponse<unknown>>;
};

export type CcoHostEnv = {
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_API_PREFIX?: string;
  NEXT_PUBLIC_DEMO_MODE?: string;
  NEXT_PUBLIC_GOOGLE_MAPS_KEY?: string;
  NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN?: string;
  NODE_ENV?: string;
};

export type CcoHostAdapter = {
  api: CcoHostApi;
  env: CcoHostEnv;
  getUser: () => CcoUser | null;
};
