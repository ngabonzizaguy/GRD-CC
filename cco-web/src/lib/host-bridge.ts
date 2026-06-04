import { apiClient } from '@admin/lib/api-client';
import type { LmxBridge, LmxBridgeEnv, SystemConfigUpdate } from '@grd/cco';
import type { LmxRes } from '@grd/cco';
import { useAuthStore } from '@/stores/auth-store';

function readHostEnv(): LmxBridgeEnv {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };
}

export function createCcoWebHost(): LmxBridge {
  return {
    api: {
      getAdmins: (params) => apiClient.getAdmins(params ?? {}),
      updateAdminRolePermissions: (adminId, role, permissions) =>
        apiClient.updateAdminRolePermissions(adminId, role, permissions),
      createAdmin: (params) => apiClient.createAdmin(params),
      getSystemConfig: () =>
        apiClient.getSystemConfig() as unknown as Promise<LmxRes<import('@grd/cco').SystemConfigResponse>>,
      updateSystemConfig: (config: SystemConfigUpdate) =>
        apiClient.updateSystemConfig(
          config as Parameters<typeof apiClient.updateSystemConfig>[0]
        ) as unknown as Promise<LmxRes<import('@grd/cco').SystemConfigResponse>>,
      getAdminInfo: () => apiClient.getAdminInfo(),
      listLogs: (params) => apiClient.searchCcoLogs(params ?? {}),
      searchActivity: (params) => apiClient.searchCcoActivity(params ?? {}),
      appendActivity: (params) => apiClient.appendCcoActivity(params),
      getNavigation: () => apiClient.getCcoNavigation(),
      putNavigation: (override) => apiClient.putCcoNavigation(override),
      getDashboardOverrides: () => apiClient.getCcoDashboardOverrides(),
      putDashboardOverrides: (overrides) => apiClient.putCcoDashboardOverrides(overrides),
      getShortcut: () => apiClient.getCcoShortcut(),
      putShortcut: (config) => apiClient.putCcoShortcut(config),
      getSecrets: () => apiClient.getCcoSecrets(),
      putSecrets: (updates) => apiClient.putCcoSecrets(updates),
      getEnvRegistry: () => apiClient.getCcoEnvRegistry(),
      putEnvRegistry: (entries) => apiClient.putCcoEnvRegistry(entries),
      getIPAllowlist: () => apiClient.getCcoIPAllowlist(),
      putIPAllowlist: (body) => apiClient.putCcoIPAllowlist(body),
      getConnectionSettings: () => apiClient.getCcoConnectionSettings(),
      putConnectionSettings: (flags) => apiClient.putCcoConnectionSettings(flags),
      getIntegrationsHealth: () => apiClient.getIntegrationsHealth(),
      listIdentities: (params) => apiClient.listIdentities(params ?? {}),
      approveIdentity: (identityId, comment) => apiClient.approveIdentity(identityId, comment),
      rejectIdentity: (identityId, rejectReason) =>
        apiClient.rejectIdentity(identityId, rejectReason),
    },
    env: readHostEnv(),
    getUser: () => {
      const user = useAuthStore.getState().user;
      if (!user) return null;
      return {
        admin_id: (user as { admin_id?: string }).admin_id,
        role: user.role as string | undefined,
        email: user.email,
        username: (user as { username?: string }).username,
        full_name: (user as { full_name?: string }).full_name,
      };
    },
  };
}
