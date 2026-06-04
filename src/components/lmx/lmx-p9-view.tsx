'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import { listActivity, type LmxTraceRow } from '@cco/services/lmx/lmx-s9';

export function LmxP9View() {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState<LmxTraceRow[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await listActivity({ page: 1, limit: 200 });
      if (res.ok) {
        setEntries(res.data.list);
        setTotal(res.data.total);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return entries;
    const q = keyword.trim().toLowerCase();
    return entries.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        (e.detail?.toLowerCase().includes(q) ?? false)
    );
  }, [entries, keyword]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Activity log
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Privileged action audit trail (local until server audit API).
        </p>
      </div>

      <LmxBlock
        title={`Events (${total})`}
        description="Filter by action or detail · synced from server when API is available"
        icon={Activity}
        action={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--lmx-mute)' }} />
            <input
              className="lmx-input pl-9 text-sm"
              placeholder="Search…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--lmx-mute)' }}>
            No matching activity.
          </p>
        ) : (
          <div className="lmx-nav-editor-list">
          <ul className="divide-y" style={{ borderColor: 'var(--lmx-hairline)' }}>
            {filtered.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-3 py-3 first:pt-0">
                <time className="text-xs lmx-mono shrink-0" style={{ color: 'var(--lmx-mute)' }}>
                  {new Date(e.timestamp).toLocaleString()}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium lmx-mono" style={{ color: 'var(--lmx-ink)' }}>
                    {e.action}
                  </p>
                  {e.detail ? (
                    <p className="text-xs" style={{ color: 'var(--lmx-body)' }}>
                      {e.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          </div>
        )}
      </LmxBlock>
    </div>
  );
}
