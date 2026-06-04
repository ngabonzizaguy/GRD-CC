'use client';

import { useEffect, useState } from 'react';
import { Loader2, ScrollText, Search } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import { listLogs, type LmxStreamRow } from '@cco/services/lmx/lmx-s8';

export function LmxP8View() {
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState<LmxStreamRow[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
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
      setEmptyMessage(res.data.list.length === 0 ? res.data.message ?? null : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          System logs
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Operational log stream for privileged debugging.
        </p>
      </div>

      <LmxBlock title="Filters" icon={ScrollText}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1 space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
              Level
            </label>
            <select className="lmx-input" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="min-w-[200px] flex-[2] space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--lmx-mute)' }} />
              <input
                className="lmx-input pl-9"
                placeholder="Message or source…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <button type="button" className="lmx-btn-primary" onClick={load} disabled={loading}>
            Apply
          </button>
        </div>
      </LmxBlock>

      <LmxBlock title="Log entries">
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm" style={{ color: 'var(--lmx-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div
            className="rounded-lg border border-dashed px-6 py-10 text-center"
            style={{ borderColor: 'var(--lmx-hairline)', background: 'var(--lmx-canvas-soft)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
              No logs available
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--lmx-body)' }}>
              {emptyMessage ?? 'No entries match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase lmx-mono" style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Level</th>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b" style={{ borderColor: 'var(--lmx-hairline)' }}>
                    <td className="py-2 pr-3 lmx-mono text-xs whitespace-nowrap">
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
      </LmxBlock>
    </div>
  );
}
