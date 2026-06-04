import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

export type LmxIpGate = {
  allowlist: string[];
  enabled: boolean;
};

export async function getIPAllowlist(): Promise<LmxResult<LmxIpGate>> {
  const getIPAllowlist = readLmxBridge().api.getIPAllowlist;
  if (!getIPAllowlist) {
    return { ok: false, code: 'no_api', message: 'IP allowlist API not configured on host' };
  }
  try {
    const res = await getIPAllowlist();
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    return {
      ok: true,
      data: {
        allowlist: mapped.data.allowlist ?? [],
        enabled: mapped.data.enabled !== false,
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function saveIPAllowlist(
  allowlist: string[],
  enabled: boolean
): Promise<LmxResult<LmxIpGate>> {
  const putIPAllowlist = readLmxBridge().api.putIPAllowlist;
  if (!putIPAllowlist) {
    return { ok: false, code: 'no_api', message: 'IP allowlist API not configured on host' };
  }
  const clean = allowlist.map((ip) => ip.trim()).filter(Boolean);
  try {
    const res = await putIPAllowlist({ allowlist: clean, enabled });
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    pushLmxAudit('lmx.ip_allowlist.update', {
      detail: `Updated allowlist (${clean.length} entries, enabled=${enabled})`,
    });
    return { ok: true, data: { allowlist: clean, enabled } };
  } catch (e) {
    return mapLmxErr(e);
  }
}
