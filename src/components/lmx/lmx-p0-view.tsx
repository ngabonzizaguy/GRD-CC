'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { Activity, ArrowRight, Cable, KeyRound, Loader2, Shield, Users } from 'lucide-react';
import { LMX_PANES } from '@cco/components/lmx/lmx-panes';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import { useLmxStore, type LmxPaneId } from '@cco/stores/lmx-store';
import { listAdmins } from '@cco/services/lmx/lmx-s4';
import { checkApiHealth } from '@cco/services/lmx/lmx-s7';
import { listActivity } from '@cco/services/lmx/lmx-s9';

export function LmxP0View() {
  const setFeature = useLmxStore((s) => s.setFeature);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<string>('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [health, admins] = await Promise.all([
        checkApiHealth(),
        listAdmins({ page: 1, limit: 1 }),
      ]);
      if (cancelled) return;
      if (health.ok) setApiOk(health.data.ok);
      if (admins.ok) setAdminCount(admins.data.total ?? admins.data.list.length);
      const activityRes = await listActivity({ page: 1, limit: 1 });
      if (activityRes.ok && activityRes.data.list[0]) {
        setLastActivity(new Date(activityRes.data.list[0].timestamp).toLocaleString());
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quickFeatures = LMX_PANES.filter((f) => f.id !== 'p0').slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
          Command center
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Overview
        </h2>
        <p className="mt-1 max-w-2xl text-sm" style={{ color: 'var(--lmx-body)' }}>
          Live status and shortcuts into privileged controls. Main admin theme is unchanged outside this shell.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="API"
          icon={Cable}
          loading={loading}
          value={apiOk === null ? '—' : apiOk ? 'Healthy' : 'Unreachable'}
          tone={apiOk ? 'ok' : apiOk === false ? 'bad' : 'neutral'}
        />
        <StatusCard
          title="Admins"
          icon={Users}
          loading={loading}
          value={adminCount === null ? '—' : String(adminCount)}
          subtitle="Total accounts (paginated fetch)"
        />
        <StatusCard
          title="Last activity"
          icon={Activity}
          loading={loading}
          value={lastActivity}
          subtitle="Latest audit entry"
        />
      </div>

      <LmxBlock title="Quick access" description="Jump to a control surface" icon={Shield}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:opacity-90"
                style={{ borderColor: 'var(--lmx-hairline)', background: 'var(--lmx-canvas-soft)' }}
                onClick={() => setFeature(f.id as LmxPaneId)}
              >
                <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {f.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--lmx-mute)' }} />
              </button>
            );
          })}
        </div>
      </LmxBlock>

      <LmxBlock
        title="Access Control"
        description="Actor policy surface"
        icon={KeyRound}
        action={
          <button type="button" className="lmx-btn-primary text-sm" onClick={() => setFeature('p4')}>
            Open Access Control
          </button>
        }
      >
        <p className="text-sm" style={{ color: 'var(--lmx-body)' }}>
          Actor registry and permission matrix. Preference toggles live under Operations.
        </p>
      </LmxBlock>
    </div>
  );
}

function StatusCard({
  title,
  icon: Icon,
  value,
  subtitle,
  loading,
  tone = 'neutral',
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  subtitle?: string;
  loading?: boolean;
  tone?: 'ok' | 'bad' | 'neutral';
}) {
  const dotColor =
    tone === 'ok' ? '#0070f3' : tone === 'bad' ? 'var(--lmx-error)' : 'var(--lmx-mute)';
  return (
    <div className="lmx-card p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
          {title}
        </span>
        <span style={{ color: 'var(--lmx-mute)' }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--lmx-mute)' }} />
        ) : (
          <>
            <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
            <p className="text-lg font-semibold tabular-nums" style={{ color: 'var(--lmx-ink)' }}>
              {value}
            </p>
          </>
        )}
      </div>
      {subtitle ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--lmx-mute)' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
