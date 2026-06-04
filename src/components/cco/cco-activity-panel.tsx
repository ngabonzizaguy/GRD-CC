'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import { listActivity, type CcoActivityEntry } from '@cco/services/cco/cco-activity.service';

export function CcoActivityPanel() {
  const [keyword, setKeyword] = useState('');
  const [entries, setEntries] = useState<CcoActivityEntry[]>([]);
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
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Activity log
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Privileged action audit trail (local until server audit API).
        </p>
      </div>

      <CcoSection
        title={`Events (${total})`}
        description="Filter by action or detail · synced from server when API is available"
        icon={Activity}
        action={
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--cco-mute)' }} />
            <input
              className="cco-input pl-9 text-sm"
              placeholder="Search…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--cco-mute)' }}>
            No matching activity.
          </p>
        ) : (
          <div className="cco-nav-editor-list">
          <ul className="divide-y" style={{ borderColor: 'var(--cco-hairline)' }}>
            {filtered.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-3 py-3 first:pt-0">
                <time className="text-xs cco-mono shrink-0" style={{ color: 'var(--cco-mute)' }}>
                  {new Date(e.timestamp).toLocaleString()}
                </time>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium cco-mono" style={{ color: 'var(--cco-ink)' }}>
                    {e.action}
                  </p>
                  {e.detail ? (
                    <p className="text-xs" style={{ color: 'var(--cco-body)' }}>
                      {e.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          </div>
        )}
      </CcoSection>
    </div>
  );
}
