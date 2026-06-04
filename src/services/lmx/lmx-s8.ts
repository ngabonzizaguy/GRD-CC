import { readLmxBridge } from '@cco/host/registry';
import { mapLmxRes, mapLmxErr, type LmxResult } from '@cco/services/lmx/types';

export type LmxStreamRow = {
  id: string;
  level?: string;
  message: string;
  timestamp?: number;
  source?: string;
};

export type LmxStreamListData = {
  list: LmxStreamRow[];
  total?: number;
  message?: string;
};

function mapServerLogRow(row: Record<string, unknown>): LmxStreamRow {
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
} = {}): Promise<LmxResult<LmxStreamListData>> {
  const listLogsFn = readLmxBridge().api.listLogs;

  if (typeof listLogsFn !== 'function') {
    return {
      ok: true,
      data: {
        list: [],
        total: 0,
      },
    };
  }

  try {
    const res = await listLogsFn(params);
    const mapped = mapLmxRes(res);
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
        message:
          list.length === 0
            ? 'No log entries yet. Module actions will appear here.'
            : undefined,
      },
    };
  } catch (e) {
    return mapLmxErr(e);
  }
}
