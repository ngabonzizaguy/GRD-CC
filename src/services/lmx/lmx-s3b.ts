import { readLmxBridge } from '@cco/host/registry';
import type { LmxEnvRow } from '@cco/host/types';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

const BUILD_ENV_KEYS: Record<string, string> = {
  NEXT_PUBLIC_API_URL: 'NEXT_PUBLIC_API_URL',
  NEXT_PUBLIC_API_PREFIX: 'NEXT_PUBLIC_API_PREFIX',
  NEXT_PUBLIC_DEMO_MODE: 'NEXT_PUBLIC_DEMO_MODE',
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: 'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
  NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN: 'NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN',
};

function mergeBuildEnvValues(entries: LmxEnvRow[]): LmxEnvRow[] {
  const env = readLmxBridge().env;
  return entries.map((entry) => {
    const envKey = BUILD_ENV_KEYS[entry.key];
    if (!envKey || entry.category !== 'build') return entry;
    const live = env[envKey as keyof typeof env];
    if (live != null && live !== '') {
      return { ...entry, value: live };
    }
    return entry;
  });
}

export async function listEnvRegistry(): Promise<LmxResult<LmxEnvRow[]>> {
  const getEnvRegistry = readLmxBridge().api.getEnvRegistry;
  if (!getEnvRegistry) {
    return { ok: false, code: 'no_api', message: 'Env registry API not configured on host' };
  }
  try {
    const res = await getEnvRegistry();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    const entries = mergeBuildEnvValues(mapped.data.entries ?? []);
    return { ok: true, data: entries };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function saveEnvRegistry(
  entries: LmxEnvRow[]
): Promise<LmxResult<LmxEnvRow[]>> {
  const putEnvRegistry = readLmxBridge().api.putEnvRegistry;
  if (!putEnvRegistry) {
    return { ok: false, code: 'no_api', message: 'Env registry API not configured on host' };
  }
  const payload = entries.map((e) => ({
    ...e,
    value: e.is_secret && e.value?.startsWith('****') ? '' : e.value,
  }));
  try {
    const res = await putEnvRegistry(payload);
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    pushLmxAudit('lmx.env.update', { detail: `Updated ${entries.length} env entries` });
    return listEnvRegistry();
  } catch (e) {
    return mapLmxErr(e);
  }
}
