'use client';

import { getLmxPane } from '@cco/components/lmx/lmx-panes';
import { useLmxStore } from '@cco/stores/lmx-store';
export function LmxStubPanel() {
  const { activeFeature } = useLmxStore();
  const feature = getLmxPane(activeFeature);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="lmx-card p-6 md:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
          Phase {feature.phase} · Shell only
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          {feature.label}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--lmx-body)' }}>
          {feature.description}. Live data and actions connect through the Lmx service layer in a
          later phase. Main admin styling is unchanged outside this overlay.
        </p>
      </div>
      {['Usage', 'Alerts', 'Recent'].map((title) => (
        <div key={title} className="lmx-card p-5">
          <p className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
            {title}
          </p>
          <p className="mt-2 text-xs lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
            Placeholder — Vercel-style card
          </p>
        </div>
      ))}
    </div>
  );
}
