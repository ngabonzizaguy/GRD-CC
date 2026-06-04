'use client';

import { getCcoFeature } from '@cco/components/cco/cco-features';
import { useCcoStore } from '@cco/stores/cco-store';
export function CcoPlaceholderPanel() {
  const { activeFeature } = useCcoStore();
  const feature = getCcoFeature(activeFeature);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="cco-card p-6 md:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
          Phase {feature.phase} · Shell only
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          {feature.label}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--cco-body)' }}>
          {feature.description}. Live data and actions will connect through the CCo service layer in a
          later phase. Main admin styling is unchanged outside this overlay.
        </p>
      </div>
      {['Usage', 'Alerts', 'Recent'].map((title) => (
        <div key={title} className="cco-card p-5">
          <p className="text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
            {title}
          </p>
          <p className="mt-2 text-xs cco-mono" style={{ color: 'var(--cco-mute)' }}>
            Placeholder — Vercel-style card
          </p>
        </div>
      ))}
    </div>
  );
}
