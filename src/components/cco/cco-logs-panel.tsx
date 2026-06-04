'use client';

import { useEffect, useState } from 'react';
import { Loader2, ScrollText, Search } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import { listLogs, type CcoLogEntry } from '@cco/services/cco/cco-logs.service';

export function CcoLogsPanel() {
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState<CcoLogEntry[]>([]);
  const [gapMessage, setGapMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await listLogs({
      page: 1,
      limit: 100,
      keyword: keyword.trim() || undefined,
      level: level || undefined,
    });
    if (res.ok) {
      setEntries(res.data.list);
      setGapMessage(
        res.data.backendGap && res.data.list.length === 0 ? res.data.message ?? null : null
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          System logs
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Operational log stream for privileged debugging.
        </p>
      </div>

      <CcoSection title="Filters" icon={ScrollText}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1 space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
              Level
            </label>
            <select className="cco-input" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="min-w-[200px] flex-[2] space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--cco-mute)' }} />
              <input
                className="cco-input pl-9"
                placeholder="Message or source…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="cco-btn-primary" onClick={load} disabled={loading}>
            Apply
          </button>
        </div>
      </CcoSection>

      <CcoSection title="Log entries">
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm" style={{ color: 'var(--cco-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : gapMessage || entries.length === 0 ? (
          <div
            className="rounded-lg border border-dashed px-6 py-10 text-center"
            style={{ borderColor: 'var(--cco-hairline)', background: 'var(--cco-canvas-soft)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
              No logs available
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--cco-body)' }}>
              {gapMessage ??
                'No entries match your filters. When the admin log API is available, results will stream here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase cco-mono" style={{ borderColor: 'var(--cco-hairline)', color: 'var(--cco-mute)' }}>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b" style={{ borderColor: 'var(--cco-hairline)' }}>
                    <td className="py-2 pr-3 cco-mono text-xs whitespace-nowrap">
                      {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 pr-3">{e.level ?? '—'}</td>
                    <td className="py-2 pr-3">{e.source ?? '—'}</td>
                    <td className="py-2">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CcoSection>
    </div>
  );
}
