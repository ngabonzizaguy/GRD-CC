import { getCcoHost } from '@cco/host/registry';
import { mapCcoApiResponse, mapCcoError, type CcoServiceResult } from '@cco/services/cco/types';

export type CcoLogEntry = {
  id: string;
  level?: string;
  message: string;
  timestamp?: number;
  source?: string;
};

export type CcoLogsListData = {
  list: CcoLogEntry[];
  total?: number;
  backendGap?: boolean;
  message?: string;
};

const BACKEND_GAP_MESSAGE =
  'Admin log list API not yet available (GET /admin/logs). See GRD-CC/docs/backend-gaps.md.';

function mapServerLogRow(row: Record<string, unknown>): CcoLogEntry {
  return {
    id: String(row.id ?? ''),
    level: row.level != null ? String(row.level) : 'info',
    message: String(row.message ?? row.detail ?? row.action ?? ''),
    timestamp: Number(row.timestamp ?? Date.now()),
    source: row.source != null ? String(row.source) : undefined,
  };
}

export async function listLogs(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  level?: string;
  source?: string;
} = {}): Promise<CcoServiceResult<CcoLogsListData>> {
  const listLogsFn = getCcoHost().api.listLogs;

  if (typeof listLogsFn !== 'function') {
    return {
      ok: true,
      data: {
        list: [],
        total: 0,
        backendGap: true,
        message: BACKEND_GAP_MESSAGE,
      },
    };
  }

  try {
    const res = await listLogsFn(params);
    const mapped = mapCcoApiResponse(res);
    if (!mapped.ok) return mapped;
    const raw = mapped.data;
    const list = Array.isArray(raw.list)
      ? (raw.list as Record<string, unknown>[]).map(mapServerLogRow)
      : [];
    return {
      ok: true,
      data: {
        list,
        total: raw.total ?? list.length,
        backendGap: list.length === 0,
        message: list.length === 0 ? 'No log entries yet. Actions recorded in CCo will appear here.' : undefined,
      },
    };
  } catch (e) {
    return mapCcoError(e);
  }
}
