'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { Activity, ArrowRight, Cable, KeyRound, Loader2, Shield, Users } from 'lucide-react';
import { CCO_FEATURES } from '@cco/components/cco/cco-features';
import { CcoSection } from '@cco/components/cco/cco-section';
import { useCcoStore, type CcoFeatureId } from '@cco/stores/cco-store';
import { listAdmins } from '@cco/services/cco/cco-rbac.service';
import { checkApiHealth } from '@cco/services/cco/cco-connection.service';
import { listActivity } from '@cco/services/cco/cco-activity.service';

export function CcoOverviewPanel() {
  const setFeature = useCcoStore((s) => s.setFeature);
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

  const quickFeatures = CCO_FEATURES.filter((f) => f.id !== 'overview').slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
          Command center
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Overview
        </h2>
        <p className="mt-1 max-w-2xl text-sm" style={{ color: 'var(--cco-body)' }}>
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

      <CcoSection title="Quick access" description="Jump to a control surface" icon={Shield}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:opacity-90"
                style={{ borderColor: 'var(--cco-hairline)', background: 'var(--cco-canvas-soft)' }}
                onClick={() => setFeature(f.id as CcoFeatureId)}
              >
                <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {f.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--cco-mute)' }} />
              </button>
            );
          })}
        </div>
      </CcoSection>

      <CcoSection
        title="RBAC"
        description="Roles, permissions, and admin accounts"
        icon={KeyRound}
        action={
          <button type="button" className="cco-btn-primary text-sm" onClick={() => setFeature('rbac')}>
            Open RBAC
          </button>
        }
      >
        <p className="text-sm" style={{ color: 'var(--cco-body)' }}>
          Create admins, assign roles, and edit permission checkboxes. Preference toggles live under Dashboard override.
        </p>
      </CcoSection>
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
    tone === 'ok' ? '#0070f3' : tone === 'bad' ? 'var(--cco-error)' : 'var(--cco-mute)';
  return (
    <div className="cco-card p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
          {title}
        </span>
        <span style={{ color: 'var(--cco-mute)' }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--cco-mute)' }} />
        ) : (
          <>
            <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
            <p className="text-lg font-semibold tabular-nums" style={{ color: 'var(--cco-ink)' }}>
              {value}
            </p>
          </>
        )}
      </div>
      {subtitle ? (
        <p className="mt-1 text-xs" style={{ color: 'var(--cco-mute)' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
