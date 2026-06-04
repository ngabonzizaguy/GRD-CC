import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

export type LmxVaultRow = {
  key: string;
  label: string;
  fingerprint: string | null;
  configured: boolean;
};

export async function getSecretsMetadata(): Promise<LmxResult<{ secrets: LmxVaultRow[] }>> {
  const getSecrets = readLmxBridge().api.getSecrets;
  if (!getSecrets) {
    return { ok: false, code: 'no_api', message: 'Secrets API not configured on host' };
  }
  try {
    const res = await getSecrets();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    const list = mapped.data.secrets ?? [];
    return {
      ok: true,
      data: {
        secrets: list.map((s) => ({
          key: s.key,
          label: s.label,
          fingerprint: s.fingerprint ?? null,
          configured: Boolean(s.configured),
        })),
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function updateSecrets(
  updates: Record<string, string>
): Promise<LmxResult<unknown>> {
  const putSecrets = readLmxBridge().api.putSecrets;
  if (!putSecrets) {
    return { ok: false, code: 'no_api', message: 'Secrets API not configured on host' };
  }
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(updates)) {
    const v = value.trim();
    if (!v || v.startsWith('****')) continue;
    clean[key] = v;
  }
  if (Object.keys(clean).length === 0) {
    return { ok: false, code: 'invalid_input', message: 'No secret values to update' };
  }
  try {
    const res = await putSecrets(clean);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.secrets.update', {
        detail: `Updated keys: ${Object.keys(clean).join(', ')}`,
      });
    }
    return mapped;
  } catch (e) {
    return mapLmxErr(e);
  }
}
