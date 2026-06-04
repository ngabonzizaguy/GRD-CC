import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, type LmxResult } from '@cco/services/lmx/types';
import type { LmxIdentityItem, LmxIdentityStatus } from '@cco/types/identity';

export async function listKycReviews(params: {
  status?: LmxIdentityStatus;
  page?: number;
  limit?: number;
}): Promise<LmxResult<{ records: LmxIdentityItem[]; total: number }>> {
  const list = readLmxBridge().api.listIdentities;
  if (!list) {
    return { ok: false, code: 'not_configured', message: 'KYC API not configured on host' };
  }
  try {
    const res = await list(params);
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    const data = mapped.data as {
      records?: LmxIdentityItem[];
      total?: number;
    };
    return {
      ok: true,
      data: {
        records: data.records ?? [],
        total: data.total ?? 0,
      },
    };
  } catch (e) {
    return {
      ok: false,
      code: 'client_error',
      message: e instanceof Error ? e.message : 'Failed to load KYC list',
    };
  }
}

export async function approveKycReview(
  identityId: string,
  comment?: string
): Promise<LmxResult<{ identity_id: string; status: string }>> {
  const approve = readLmxBridge().api.approveIdentity;
  if (!approve) {
    return { ok: false, code: 'not_configured', message: 'KYC API not configured on host' };
  }
  try {
    const res = await approve(identityId, comment);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.kyc.approve', { detail: `Approved ${identityId}`, target: identityId });
    }
    return mapped as LmxResult<{ identity_id: string; status: string }>;
  } catch (e) {
    return {
      ok: false,
      code: 'client_error',
      message: e instanceof Error ? e.message : 'Failed to approve',
    };
  }
}

export async function rejectKycReview(
  identityId: string,
  rejectReason: string
): Promise<LmxResult<{ identity_id: string; status: string }>> {
  const reject = readLmxBridge().api.rejectIdentity;
  if (!reject) {
    return { ok: false, code: 'not_configured', message: 'KYC API not configured on host' };
  }
  try {
    const res = await reject(identityId, rejectReason);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.kyc.reject', {
        detail: `Rejected ${identityId}: ${rejectReason}`,
        target: identityId,
      });
    }
    return mapped as LmxResult<{ identity_id: string; status: string }>;
  } catch (e) {
    return {
      ok: false,
      code: 'client_error',
      message: e instanceof Error ? e.message : 'Failed to reject',
    };
  }
}
