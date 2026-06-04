import { readLmxBridge } from '@cco/host/registry';
import type { SystemConfigResponse, SystemConfigUpdate } from '@cco/types/admin';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';


export type LmxBuildEnvKey =
  | 'NEXT_PUBLIC_API_URL'
  | 'NEXT_PUBLIC_API_PREFIX'
  | 'NEXT_PUBLIC_DEMO_MODE'
  | 'NEXT_PUBLIC_GOOGLE_MAPS_KEY'
  | 'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN';

export type LmxBuildEnvEntry = {
  key: LmxBuildEnvKey;
  value: string;
  
  sensitive: boolean;
};

export type LmxEnvBundle = {
  runtime: SystemConfigResponse;
  buildTime: LmxBuildEnvEntry[];
};

const BUILD_TIME_ENV_KEYS: LmxBuildEnvKey[] = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_PREFIX',
  'NEXT_PUBLIC_DEMO_MODE',
  'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
];

const SENSITIVE_BUILD_KEYS = new Set<LmxBuildEnvKey>([
  'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
  'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
]);

function readBuildTimeEnv(): LmxBuildEnvEntry[] {
  const env = readLmxBridge().env;
  const envMap: Record<LmxBuildEnvKey, string | undefined> = {
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

export async function getEnvConfig(): Promise<LmxResult<LmxEnvBundle>> {
  try {
    const res = await readLmxBridge().api.getSystemConfig();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    return {
      ok: true,
      data: {
        runtime: mapped.data,
        buildTime: readBuildTimeEnv(),
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}


export async function fetchSystemConfig(): Promise<LmxResult<SystemConfigResponse>> {
  try {
    const res = await readLmxBridge().api.getSystemConfig();
    return mapLmxRes(res);
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function updateRuntimeEnvConfig(
  patch: SystemConfigUpdate
): Promise<LmxResult<SystemConfigResponse>> {
  try {
    const res = await readLmxBridge().api.updateSystemConfig(patch);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.env.update', {
        detail: 'Updated runtime system config',
        keys: Object.keys(patch),
      });
    }
    return mapped;
  } catch (e) {
    return mapLmxErr(e);
  }
}

export function getBuildTimeEnv(): LmxResult<LmxBuildEnvEntry[]> {
  return { ok: true, data: readBuildTimeEnv() };
}

export type LmxPublicEnvRow = {
  key: string;
  value: string;
  source: 'build-time';
};


export function listPublicEnvVars(): LmxPublicEnvRow[] {
  return readBuildTimeEnv().map((entry) => ({
    key: entry.key,
    value: entry.sensitive && entry.value ? `****${entry.value.slice(-4)}` : entry.value || '(empty)',
    source: 'build-time' as const,
  }));
}


export const patchSystemConfig = updateRuntimeEnvConfig;
