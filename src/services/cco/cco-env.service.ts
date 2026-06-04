import { getCcoHost } from '@cco/host/registry';
import type { SystemConfigResponse, SystemConfigUpdate } from '@cco/types/admin';
import { recordCcoActivity } from '@cco/services/cco/cco-activity-log';
import { mapCcoApiResponse, mapCcoError, type CcoServiceResult } from '@cco/services/cco/types';

/** Build-time env keys exposed read-only (inlined at Next.js build). */
export type CcoBuildTimeEnvKey =
  | 'NEXT_PUBLIC_API_URL'
  | 'NEXT_PUBLIC_API_PREFIX'
  | 'NEXT_PUBLIC_DEMO_MODE'
  | 'NEXT_PUBLIC_GOOGLE_MAPS_KEY'
  | 'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN';

export type CcoBuildTimeEnvEntry = {
  key: CcoBuildTimeEnvKey;
  value: string;
  /** True when the value looks like a secret (masked in UI). */
  sensitive: boolean;
};

export type CcoEnvData = {
  runtime: SystemConfigResponse;
  buildTime: CcoBuildTimeEnvEntry[];
};

const BUILD_TIME_ENV_KEYS: CcoBuildTimeEnvKey[] = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_PREFIX',
  'NEXT_PUBLIC_DEMO_MODE',
  'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
];

const SENSITIVE_BUILD_KEYS = new Set<CcoBuildTimeEnvKey>([
  'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
]);

function readBuildTimeEnv(): CcoBuildTimeEnvEntry[] {
  const env = getCcoHost().env;
  const envMap: Record<CcoBuildTimeEnvKey, string | undefined> = {
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_PREFIX: env.NEXT_PUBLIC_API_PREFIX,
    NEXT_PUBLIC_DEMO_MODE: env.NEXT_PUBLIC_DEMO_MODE,
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN,
  };

  return BUILD_TIME_ENV_KEYS.map((key) => ({
    key,
    value: envMap[key] ?? '',
    sensitive: SENSITIVE_BUILD_KEYS.has(key),
  }));
}

export async function getEnvConfig(): Promise<CcoServiceResult<CcoEnvData>> {
  try {
    const res = await getCcoHost().api.getSystemConfig();
    const mapped = mapCcoApiResponse(res);
    if (!mapped.ok) return mapped;
    return {
      ok: true,
      data: {
        runtime: mapped.data,
        buildTime: readBuildTimeEnv(),
      },
    };
  } catch (e) {
    return mapCcoError(e);
  }
}

/** Fetch runtime system config only (panel alias). */
export async function fetchSystemConfig(): Promise<CcoServiceResult<SystemConfigResponse>> {
  try {
    const res = await getCcoHost().api.getSystemConfig();
    return mapCcoApiResponse(res);
  } catch (e) {
    return mapCcoError(e);
  }
}

export async function updateRuntimeEnvConfig(
  patch: SystemConfigUpdate
): Promise<CcoServiceResult<SystemConfigResponse>> {
  try {
    const res = await getCcoHost().api.updateSystemConfig(patch);
    const mapped = mapCcoApiResponse(res);
    if (mapped.ok) {
      recordCcoActivity('cco.env.update', {
        detail: 'Updated runtime system config',
        keys: Object.keys(patch),
      });
    }
    return mapped;
  } catch (e) {
    return mapCcoError(e);
  }
}

export function getBuildTimeEnv(): CcoServiceResult<CcoBuildTimeEnvEntry[]> {
  return { ok: true, data: readBuildTimeEnv() };
}

export type CcoPublicEnvRow = {
  key: string;
  value: string;
  source: 'build-time';
};

/** Sync read-only list for env panel (build-time NEXT_PUBLIC_*). */
export function listPublicEnvVars(): CcoPublicEnvRow[] {
  return readBuildTimeEnv().map((entry) => ({
    key: entry.key,
    value: entry.sensitive && entry.value ? `****${entry.value.slice(-4)}` : entry.value || '(empty)',
    source: 'build-time' as const,
  }));
}

/** Panel alias for updateRuntimeEnvConfig. */
export const patchSystemConfig = updateRuntimeEnvConfig;
