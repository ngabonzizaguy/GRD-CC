import { readLmxBridge } from '@cco/host/registry';
import type { AdminRole } from '@cco/types/admin';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

export interface LmxActorRow {
  admin_id: string;
  role: AdminRole;
  permissions?: string[];
  full_name?: string;
  username?: string;
  email?: string;
}

export interface LmxActorList {
  list: LmxActorRow[];
  total?: number;
}

export async function listAdmins(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: string;
  status?: string;
} = {}): Promise<LmxResult<LmxActorList>> {
  try {
    const res = await readLmxBridge().api.getAdmins(params);
    const mapped = mapLmxRes(res);
    if (!mapped.ok) return mapped;
    const raw = mapped.data as { list?: LmxActorRow[]; total?: number };
    return {
      ok: true,
      data: {
        list: raw.list ?? [],
        total: raw.total,
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function updateAdminRolePermissions(
  adminId: string,
  role: AdminRole,
  permissions: string[]
): Promise<LmxResult<unknown>> {
  try {
    const res = await readLmxBridge().api.updateAdminRolePermissions(adminId, role, permissions);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.rbac.update', {
        detail: `Updated admin ${adminId} role to ${role}`,
        adminId,
        role,
        permissionCount: permissions.length,
      });
    }
    return mapped;
  } catch (e) {
    return mapLmxErr(e);
  }
}

export async function createAdmin(params: {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions?: string[];
  department?: string;
  job_title?: string;
}): Promise<LmxResult<unknown>> {
  try {
    const res = await readLmxBridge().api.createAdmin(params);
    const mapped = mapLmxRes(res);
    if (mapped.ok) {
      pushLmxAudit('lmx.rbac.create', {
        detail: `Created admin ${params.username}`,
        username: params.username,
        email: params.email,
        role: params.role,
      });
    }
    return mapped;
  } catch (e) {
    return mapLmxErr(e);
  }
}
