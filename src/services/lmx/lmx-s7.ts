import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

export type LmxLinkStatusLevel = 'ok' | 'degraded' | 'error';

export type LmxHealthProbe = {
  endpoint: string;
  ok: boolean;
  latencyMs?: number;
  statusCode?: number;
  message?: string;
};

export type LmxLinkData = {
  status: LmxLinkStatusLevel;
  apiUrl: string;
  demoMode: boolean;
  healthCheck?: LmxHealthProbe;
};

const HEALTH_TIMEOUT_MS = 5000;

function getApiBaseUrl(): string {
  const env = readLmxBridge().env;
  return env.NEXT_PUBLIC_API_URL || 'http://localhost:8611';
}

function isDemoMode(): boolean {
  return readLmxBridge().env.NEXT_PUBLIC_DEMO_MODE !== 'false';
}

async function probeEndpoint(url: string): Promise<LmxHealthProbe> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
    });
    const latencyMs = Date.now() - start;
    return {
      endpoint: url,
      ok: response.ok,
      latencyMs,
      statusCode: response.status,
      message: response.ok ? 'Reachable' : `HTTP ${response.status}`,
    };
  } catch (e) {
    return {
      endpoint: url,
      ok: false,
      latencyMs: Date.now() - start,
      message: e instanceof Error ? e.message : 'Health check failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getConnectionStatus(): Promise<LmxResult<LmxLinkData>> {
  const apiUrl = getApiBaseUrl();
  const demoMode = isDemoMode();

  if (demoMode) {
    return {
      ok: true,
      data: {
        status: 'degraded',
        apiUrl,
        demoMode: true,
        healthCheck: {
          endpoint: apiUrl,
          ok: true,
          message: 'Demo mode — using mock API client',
        },
      },
    };
  }

  const getAdminInfo = readLmxBridge().api.getAdminInfo;

  try {
    if (getAdminInfo) {
      const infoRes = await getAdminInfo();
      const mapped = mapLmxRes(infoRes);
      if (mapped.ok) {
        return {
          ok: true,
          data: {
            status: 'ok',
            apiUrl,
            demoMode: false,
            healthCheck: {
              endpoint: `${apiUrl}/info`,
              ok: true,
              message: 'Admin info endpoint responded',
            },
          },
        };
      }
    }

    const fallback = await probeEndpoint(apiUrl);
    return {
      ok: true,
      data: {
        status: fallback.ok ? 'degraded' : 'error',
        apiUrl,
        demoMode: false,
        healthCheck: fallback,
      },
    };
  } catch {
    const healthCheck = await probeEndpoint(`${apiUrl}/info`);
    const baseCheck = healthCheck.ok ? healthCheck : await probeEndpoint(apiUrl);

    return {
      ok: true,
      data: {
        status: baseCheck.ok ? 'degraded' : 'error',
        apiUrl,
        demoMode: false,
        healthCheck: baseCheck,
      },
    };
  }
}

export type LmxHealthStatus = {
  ok: boolean;
  latencyMs?: number;
  message?: string;
  checkedAt: string;
};

export type LmxLinkInfo = {
  apiBaseUrl: string;
  apiPrefix: string;
  demoMode: boolean;
  appEnv: string;
};

export function getConnectionInfo(): LmxLinkInfo {
  const env = readLmxBridge().env;
  return {
    apiBaseUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:8611',
    apiPrefix: env.NEXT_PUBLIC_API_PREFIX || '',
    demoMode: env.NEXT_PUBLIC_DEMO_MODE !== 'false',
    appEnv: env.NODE_ENV || 'development',
  };
}

export async function checkApiHealth(): Promise<LmxResult<LmxHealthStatus>> {
  const result = await getConnectionStatus();
  if (!result.ok) return result;
  const hc = result.data.healthCheck;
  const ok = result.data.status === 'ok' || result.data.status === 'degraded';
  return {
    ok: true,
    data: {
      ok,
      latencyMs: hc?.latencyMs,
      message: hc?.message ?? result.data.status,
      checkedAt: new Date().toISOString(),
    },
  };
}

export type LmxHealthRow = {
  name: string;
  status: string;
  message?: string;
  latencyMs?: number;
};

export type LmxHealthBundle = {
  status: string;
  checks: LmxHealthRow[];
  checkedAt?: number;
};

export type LmxLinkFlags = {
  maintenanceBypass: boolean;
  strictApiTls: boolean;
};

export async function fetchIntegrationsHealth(): Promise<LmxResult<LmxHealthBundle>> {
  const getHealth = readLmxBridge().api.getIntegrationsHealth;
  if (!getHealth) {
    return { ok: false, code: 'no_api', message: 'Integrations health API not configured on host' };
  }
  try {
    const res = await getHealth();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    return {
      ok: true,
      data: {
        status: mapped.data.status ?? 'unknown',
        checks: (mapped.data.checks ?? []).map((c) => ({
          name: c.name,
          status: c.status,
          message: c.message,
          latencyMs: c.latency_ms,
        })),
        checkedAt: mapped.data.checked_at,
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function getConnectionFlags(): Promise<LmxResult<LmxLinkFlags>> {
  const getSettings = readLmxBridge().api.getConnectionSettings;
  if (!getSettings) {
    return {
      ok: true,
      data: { maintenanceBypass: false, strictApiTls: false },
    };
  }
  try {
    const res = await getSettings();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    const f = mapped.data.flags ?? {};
    return {
      ok: true,
      data: {
        maintenanceBypass: Boolean(f.maintenance_bypass),
        strictApiTls: Boolean(f.strict_api_tls),
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function saveConnectionFlags(
  flags: LmxLinkFlags
): Promise<LmxResult<LmxLinkFlags>> {
  const putSettings = readLmxBridge().api.putConnectionSettings;
  if (!putSettings) {
    return { ok: false, code: 'no_api', message: 'Connection settings API not configured on host' };
  }
  try {
    const res = await putSettings({
      maintenance_bypass: flags.maintenanceBypass,
      strict_api_tls: flags.strictApiTls,
    });
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    pushLmxAudit('lmx.connection.update', {
      detail: `maintenance_bypass=${flags.maintenanceBypass}, strict_api_tls=${flags.strictApiTls}`,
    });
    return { ok: true, data: flags };
  } catch (e) {
    return mapLmxErr(e);
  }
}
