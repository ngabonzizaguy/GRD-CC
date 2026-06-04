import { getCcoHost } from '@cco/host/registry';
import { mapCcoApiResponse, type CcoServiceResult } from '@cco/services/cco/types';

export type CcoConnectionStatusLevel = 'ok' | 'degraded' | 'error';

export type CcoHealthCheckResult = {
  endpoint: string;
  ok: boolean;
  latencyMs?: number;
  statusCode?: number;
  message?: string;
};

export type CcoConnectionData = {
  status: CcoConnectionStatusLevel;
  apiUrl: string;
  demoMode: boolean;
  healthCheck?: CcoHealthCheckResult;
};

const HEALTH_TIMEOUT_MS = 5000;

function getApiBaseUrl(): string {
  const env = getCcoHost().env;
  return env.NEXT_PUBLIC_API_URL || 'http://localhost:8611';
}

function isDemoMode(): boolean {
  return getCcoHost().env.NEXT_PUBLIC_DEMO_MODE !== 'false';
}

async function probeEndpoint(url: string): Promise<CcoHealthCheckResult> {
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

export async function getConnectionStatus(): Promise<CcoServiceResult<CcoConnectionData>> {
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

  const getAdminInfo = getCcoHost().api.getAdminInfo;

  try {
    if (getAdminInfo) {
      const infoRes = await getAdminInfo();
      const mapped = mapCcoApiResponse(infoRes);
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

export type CcoHealthStatus = {
  ok: boolean;
  latencyMs?: number;
  message?: string;
  checkedAt: string;
};

export type CcoConnectionInfo = {
  apiBaseUrl: string;
  apiPrefix: string;
  demoMode: boolean;
  appEnv: string;
};

export function getConnectionInfo(): CcoConnectionInfo {
  const env = getCcoHost().env;
  return {
    apiBaseUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:8611',
    apiPrefix: env.NEXT_PUBLIC_API_PREFIX || '',
    demoMode: env.NEXT_PUBLIC_DEMO_MODE !== 'false',
    appEnv: env.NODE_ENV || 'development',
  };
}

export async function checkApiHealth(): Promise<CcoServiceResult<CcoHealthStatus>> {
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
