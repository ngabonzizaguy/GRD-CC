import { getCcoHost } from '@cco/host/registry';
import { mapCcoApiResponse, mapCcoError, type CcoServiceResult } from '@cco/services/cco/types';

export const CCO_ACTIVITY_STORAGE_KEY = 'gr_cco_activity';
const MAX_ACTIVITY_ENTRIES = 200;

export type CcoActivityMeta = {
  detail?: string;
  [key: string]: unknown;
};

export type CcoActivityEntry = {
  id: string;
  action: string;
  detail?: string;
  actor?: string;
  target?: string;
  /** Display string for panel (derived from meta when recording). */
  meta?: string;
  metaRaw?: CcoActivityMeta;
  timestamp: number;
};

function readEntries(): CcoActivityEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CCO_ACTIVITY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CcoActivityEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: CcoActivityEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CCO_ACTIVITY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ACTIVITY_ENTRIES)));
}

export function appendActivity(
  action: string,
  detail?: string,
  meta?: CcoActivityMeta
): CcoServiceResult<CcoActivityEntry> {
  const metaDisplay =
    detail ??
    (meta && typeof meta.detail === 'string' ? meta.detail : undefined);

  const entry: CcoActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    action,
    detail,
    actor: typeof meta?.actor === 'string' ? meta.actor : 'super_admin',
    target: typeof meta?.target === 'string' ? meta.target : undefined,
    meta: metaDisplay,
    metaRaw: meta,
    timestamp: Date.now(),
  };

  const entries = [entry, ...readEntries()].slice(0, MAX_ACTIVITY_ENTRIES);
  writeEntries(entries);

  const append = getCcoHost().api.appendActivity;
  if (append) {
    void append({
      action,
      detail: metaDisplay,
      target: typeof meta?.target === 'string' ? meta.target : undefined,
      source: 'cco',
    }).catch(() => {});
  }

  return { ok: true, data: entry };
}

function mapServerActivityRow(row: Record<string, unknown>): CcoActivityEntry {
  return {
    id: String(row.id ?? row.log_id ?? `${Date.now()}`),
    action: String(row.action ?? ''),
    detail: row.detail != null ? String(row.detail) : undefined,
    actor: row.admin_id != null ? String(row.admin_id) : undefined,
    target: row.target != null ? String(row.target) : undefined,
    meta: row.detail != null ? String(row.detail) : undefined,
    timestamp: Number(row.timestamp ?? row.created_at ?? Date.now()),
  };
}

export async function listActivity(
  paramsOrLimit?: { page?: number; limit?: number; keyword?: string } | number
): Promise<CcoServiceResult<{ list: CcoActivityEntry[]; total: number }>> {
  const limit =
    typeof paramsOrLimit === 'number'
      ? paramsOrLimit
      : paramsOrLimit?.limit ?? 50;
  const page = typeof paramsOrLimit === 'object' && paramsOrLimit?.page ? paramsOrLimit.page : 1;
  const keyword =
    typeof paramsOrLimit === 'object' ? paramsOrLimit.keyword?.trim().toLowerCase() : undefined;

  let all = readEntries();
  if (keyword) {
    all = all.filter(
      (e) =>
        e.action.toLowerCase().includes(keyword) ||
        (e.detail?.toLowerCase().includes(keyword) ?? false) ||
        (e.actor?.toLowerCase().includes(keyword) ?? false) ||
        (e.target?.toLowerCase().includes(keyword) ?? false) ||
        (e.meta?.toLowerCase().includes(keyword) ?? false)
    );
  }

  const search = getCcoHost().api.searchActivity;
  if (search) {
    try {
      const res = await search({ page, limit, keyword });
      const mapped = mapCcoApiResponse(res);
      if (mapped.ok && Array.isArray(mapped.data.list)) {
        const list = (mapped.data.list as Record<string, unknown>[]).map(mapServerActivityRow);
        return {
          ok: true,
          data: { list, total: Number(mapped.data.total ?? list.length) },
        };
      }
    } catch (e) {
      return mapCcoError(e);
    }
  }

  const offset = (page - 1) * limit;
  const list = all.slice(offset, offset + limit);
  return { ok: true, data: { list, total: all.length } };
}
