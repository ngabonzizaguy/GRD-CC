export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'analyst';

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
