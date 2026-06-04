'use client';

import { useEffect, useState } from 'react';
import { Cable, Loader2, RefreshCw } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import {
  getConnectionStatus,
  type CcoConnectionData,
} from '@cco/services/cco/cco-connection.service';

export function CcoConnectionPanel() {
  const [data, setData] = useState<CcoConnectionData | null>(null);
  const [checking, setChecking] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    const res = await getConnectionStatus();
    if (res.ok) setData(res.data);
    setChecking(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const statusLabel =
    data?.status === 'ok' ? 'Healthy' : data?.status === 'degraded' ? 'Degraded' : data?.status === 'error' ? 'Error' : '—';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Connections
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          App ↔ API connectivity, demo mode, and deploy hints.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="cco-card p-5">
          <p className="text-xs uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
            API URL
          </p>
          <p className="mt-2 break-all text-sm font-medium cco-mono" style={{ color: 'var(--cco-ink)' }}>
            {data?.apiUrl ?? '—'}
          </p>
        </div>
        <div className="cco-card p-5">
          <p className="text-xs uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
            Demo mode
          </p>
          <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--cco-ink)' }}>
            {data?.demoMode ? 'On' : 'Off'}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--cco-mute)' }}>
            NEXT_PUBLIC_DEMO_MODE
          </p>
        </div>
      </div>

      <CcoSection
        title="Health"
        description="Admin info probe or HTTP fallback"
        icon={Cable}
        action={
          <button type="button" className="cco-btn-ghost inline-flex items-center gap-2 text-sm" onClick={runCheck} disabled={checking}>
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recheck
          </button>
        }
      >
        {data ? (
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt style={{ color: 'var(--cco-mute)' }}>Status</dt>
              <dd className="font-medium" style={{ color: data.status === 'ok' ? 'var(--cco-link)' : 'var(--cco-error)' }}>
                {statusLabel}
              </dd>
            </div>
            <div>
              <dt style={{ color: 'var(--cco-mute)' }}>Latency</dt>
              <dd className="cco-mono" style={{ color: 'var(--cco-ink)' }}>
                {data.healthCheck?.latencyMs != null ? `${data.healthCheck.latencyMs} ms` : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt style={{ color: 'var(--cco-mute)' }}>Endpoint</dt>
              <dd className="cco-mono text-xs break-all" style={{ color: 'var(--cco-body)' }}>
                {data.healthCheck?.endpoint ?? '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt style={{ color: 'var(--cco-mute)' }}>Message</dt>
              <dd style={{ color: 'var(--cco-body)' }}>{data.healthCheck?.message ?? '—'}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm" style={{ color: 'var(--cco-mute)' }}>
            No health data yet.
          </p>
        )}
      </CcoSection>

      <CcoSection title="Deploy hints">
        <ul className="list-inside list-disc space-y-2 text-sm" style={{ color: 'var(--cco-body)' }}>
          <li>Set <span className="cco-mono">NEXT_PUBLIC_API_URL</span> on Vercel for each environment.</li>
          <li>Use <span className="cco-mono">NEXT_PUBLIC_DEMO_MODE=false</span> in production.</li>
          <li>Prefix <span className="cco-mono">NEXT_PUBLIC_API_PREFIX</span> when the API sits behind a path.</li>
        </ul>
      </CcoSection>
    </div>
  );
}
