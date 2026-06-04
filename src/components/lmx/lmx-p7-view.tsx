'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cable, Loader2, RefreshCw, Save } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import {
  fetchIntegrationsHealth,
  getConnectionFlags,
  getConnectionStatus,
  saveConnectionFlags,
  type LmxLinkData,
  type LmxLinkFlags,
  type LmxHealthBundle,
} from '@cco/services/lmx/lmx-s7';
import { toast } from 'sonner';

export function LmxP7View() {
  const [data, setData] = useState<LmxLinkData | null>(null);
  const [integrations, setIntegrations] = useState<LmxHealthBundle | null>(null);
  const [flags, setFlags] = useState<LmxLinkFlags | null>(null);
  const [checking, setChecking] = useState(false);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [flagsSaving, setFlagsSaving] = useState(false);

  const runCheck = useCallback(async () => {
    setChecking(true);
    const [statusRes, healthRes, flagsRes] = await Promise.all([
      getConnectionStatus(),
      fetchIntegrationsHealth(),
      getConnectionFlags(),
    ]);
    if (statusRes.ok) setData(statusRes.data);
    if (healthRes.ok) setIntegrations(healthRes.data);
    if (flagsRes.ok) setFlags(flagsRes.data);
    setFlagsLoading(false);
    setChecking(false);
  }, []);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  const handleSaveFlags = async () => {
    if (!flags) return;
    setFlagsSaving(true);
    const res = await saveConnectionFlags(flags);
    if (res.ok) {
      toast.success('Connection settings saved');
    } else {
      toast.error(res.message);
    }
    setFlagsSaving(false);
  };

  const statusLabel =
    data?.status === 'ok' ? 'Healthy' : data?.status === 'degraded' ? 'Degraded' : data?.status === 'error' ? 'Error' : '—';

  const integrationStatusLabel = (status: string) => {
    if (status === 'ok') return 'OK';
    if (status === 'degraded') return 'Degraded';
    if (status === 'error') return 'Error';
    return status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Connections
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          App ↔ API connectivity, integration health, and connection flags.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="lmx-card p-5">
          <p className="text-xs uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
            API URL
          </p>
          <p className="mt-2 break-all text-sm font-medium lmx-mono" style={{ color: 'var(--lmx-ink)' }}>
            {data?.apiUrl ?? '—'}
          </p>
        </div>
        <div className="lmx-card p-5">
          <p className="text-xs uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
            Demo mode
          </p>
          <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--lmx-ink)' }}>
            {data?.demoMode ? 'On' : 'Off'}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--lmx-mute)' }}>
            NEXT_PUBLIC_DEMO_MODE
          </p>
        </div>
      </div>

      <LmxBlock
        title="Integrations health"
        description="Server-side checks for external services"
        icon={Cable}
        action={
          <button
            type="button"
            className="lmx-btn-ghost inline-flex items-center gap-2 text-sm"
            onClick={() => void runCheck()}
            disabled={checking}
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recheck
          </button>
        }
      >
        {integrations ? (
          <div className="space-y-4">
            <p className="text-sm">
              <span style={{ color: 'var(--lmx-mute)' }}>Overall: </span>
              <span className="font-medium" style={{ color: 'var(--lmx-ink)' }}>
                {integrationStatusLabel(integrations.status)}
              </span>
            </p>
            {integrations.checks.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--lmx-mute)' }}>
                No integration checks returned.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b lmx-mono text-xs uppercase" style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}>
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Latency</th>
                      <th className="py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrations.checks.map((check) => (
                      <tr key={check.name} className="border-b" style={{ borderColor: 'var(--lmx-hairline)' }}>
                        <td className="py-2 pr-3 font-medium" style={{ color: 'var(--lmx-ink)' }}>
                          {check.name}
                        </td>
                        <td className="py-2 pr-3">{integrationStatusLabel(check.status)}</td>
                        <td className="py-2 pr-3 lmx-mono">
                          {check.latencyMs != null ? `${check.latencyMs} ms` : '—'}
                        </td>
                        <td className="py-2" style={{ color: 'var(--lmx-body)' }}>
                          {check.message ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--lmx-mute)' }}>
            {checking ? 'Loading…' : 'No integration health data yet.'}
          </p>
        )}
      </LmxBlock>

      <LmxBlock
        title="API probe"
        description="Admin info probe or HTTP fallback"
        icon={Cable}
      >
        {data ? (
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt style={{ color: 'var(--lmx-mute)' }}>Status</dt>
              <dd className="font-medium" style={{ color: data.status === 'ok' ? 'var(--lmx-link)' : 'var(--lmx-error)' }}>
                {statusLabel}
              </dd>
            </div>
            <div>
              <dt style={{ color: 'var(--lmx-mute)' }}>Latency</dt>
              <dd className="lmx-mono" style={{ color: 'var(--lmx-ink)' }}>
                {data.healthCheck?.latencyMs != null ? `${data.healthCheck.latencyMs} ms` : '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt style={{ color: 'var(--lmx-mute)' }}>Endpoint</dt>
              <dd className="lmx-mono text-xs break-all" style={{ color: 'var(--lmx-body)' }}>
                {data.healthCheck?.endpoint ?? '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt style={{ color: 'var(--lmx-mute)' }}>Message</dt>
              <dd style={{ color: 'var(--lmx-body)' }}>{data.healthCheck?.message ?? '—'}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm" style={{ color: 'var(--lmx-mute)' }}>
            No health data yet.
          </p>
        )}
      </LmxBlock>

      <LmxBlock title="Connection flags" description="Remote link flags on server">
        {flagsLoading || !flags ? (
          <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--lmx-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading flags…
          </div>
        ) : (
          <div className="space-y-4">
            <FlagRow
              label="Maintenance bypass"
              description="Allow admin API access during maintenance mode"
              checked={flags.maintenanceBypass}
              onChange={(v) => setFlags((f) => (f ? { ...f, maintenanceBypass: v } : f))}
            />
            <FlagRow
              label="Strict API TLS"
              description="Reject non-TLS API connections in production"
              checked={flags.strictApiTls}
              onChange={(v) => setFlags((f) => (f ? { ...f, strictApiTls: v } : f))}
            />
            <button
              type="button"
              className="lmx-btn-primary inline-flex items-center gap-2"
              disabled={flagsSaving}
              onClick={() => void handleSaveFlags()}
            >
              {flagsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save connection flags
            </button>
          </div>
        )}
      </LmxBlock>

      <LmxBlock title="Deploy hints">
        <ul className="list-inside list-disc space-y-2 text-sm" style={{ color: 'var(--lmx-body)' }}>
          <li>Set <span className="lmx-mono">NEXT_PUBLIC_API_URL</span> on Vercel for each environment.</li>
          <li>Use <span className="lmx-mono">NEXT_PUBLIC_DEMO_MODE=false</span> in production.</li>
          <li>Prefix <span className="lmx-mono">NEXT_PUBLIC_API_PREFIX</span> when the API sits behind a path.</li>
        </ul>
      </LmxBlock>
    </div>
  );
}

function FlagRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg p-4"
      style={{ background: 'var(--lmx-canvas-soft)' }}
    >
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--lmx-ink)' }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: 'var(--lmx-body)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="lmx-switch"
        data-checked={checked}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
