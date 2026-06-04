import { getCcoHost } from '@cco/host/registry';
import type { AdminRole } from '@cco/types/admin';
import { recordCcoActivity } from '@cco/services/cco/cco-activity-log';
import { mapCcoApiResponse, mapCcoError, type CcoServiceResult } from '@cco/services/cco/types';

export interface CcoAdminListItem {
  admin_id: string;
  role: AdminRole;
  permissions?: string[];
  full_name?: string;
  username?: string;
  email?: string;
}

export interface CcoAdminListData {
  list: CcoAdminListItem[];
  total?: number;
}

export async function listAdmins(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  role?: string;
  status?: string;
} = {}): Promise<CcoServiceResult<CcoAdminListData>> {
  try {
    const res = await getCcoHost().api.getAdmins(params);
    const mapped = mapCcoApiResponse(res);
    if (!mapped.ok) return mapped;
    const raw = mapped.data as { list?: CcoAdminListItem[]; total?: number };
    return {
      ok: true,
      data: {
        list: raw.list ?? [],
        total: raw.total,
      },
    };
  } catch (e) {
    return mapCcoError(e);
  }
}

export async function updateAdminRolePermissions(
  adminId: string,
  role: AdminRole,
  permissions: string[]
): Promise<CcoServiceResult<unknown>> {
  try {
    const res = await getCcoHost().api.updateAdminRolePermissions(adminId, role, permissions);
    const mapped = mapCcoApiResponse(res);
    if (mapped.ok) {
      recordCcoActivity('cco.rbac.update', {
        detail: `Updated admin ${adminId} role to ${role}`,
        adminId,
        role,
        permissionCount: permissions.length,
      });
    }
    return mapped;
  } catch (e) {
    return mapCcoError(e);
  }
}

export async function createAdmin(params: {
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  department?: string;
  job_title?: string;
}): Promise<CcoServiceResult<unknown>> {
  try {
    const res = await getCcoHost().api.createAdmin(params);
    const mapped = mapCcoApiResponse(res);
    if (mapped.ok) {
      recordCcoActivity('cco.rbac.create', {
        detail: `Created admin ${params.username}`,
        username: params.username,
        email: params.email,
        role: params.role,
      });
    }
    return mapped;
  } catch (e) {
    return mapCcoError(e);
  }
}
