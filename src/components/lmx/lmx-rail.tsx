'use client';

import { useEffect, useState } from 'react';
import { LMX_PANES } from '@cco/components/lmx/lmx-panes';
import { useLmxStore, type LmxPaneId } from '@cco/stores/lmx-store';
import { cn } from '@cco/lib/cn';

function useMinWidthMd() {
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMd;
}

export function LmxRail() {
  const { activeFeature, setFeature, mobileNavOpen } = useLmxStore();
  const isMd = useMinWidthMd();
  const drawerHidden = !isMd && !mobileNavOpen;

  return (
    <aside
      id="lmx-rail"
      className={cn('lmx-rail-panel', mobileNavOpen && 'lmx-drawer-open')}
      aria-label="Lmx navigation"
      aria-hidden={drawerHidden}
    >
      <div className="border-b px-4 py-4" style={{ borderColor: 'var(--lmx-hairline)' }}>
        <div className="flex items-center gap-2">
          <span className="lmx-status-dot" data-status="online" aria-hidden />
          <p
            className="lmx-mono text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--lmx-mute)' }}
          >
            Navigation
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--lmx-ink)' }}>
          Command Center
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Features">
        {LMX_PANES.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              type="button"
              className="lmx-nav-item lmx-focus-ring"
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setFeature(feature.id as LmxPaneId)}
            >
              <Icon className={cn('h-4 w-4 shrink-0')} strokeWidth={1.75} />
              <span className="truncate">{feature.label}</span>
            </button>
          );
        })}
      </nav>
      <div
        className="border-t px-4 py-3 lmx-mono"
        style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}
      >
        <span className="lmx-kbd-group" aria-label="Keyboard shortcut to open module">
          <kbd className="lmx-kbd">Ctrl</kbd>
          <span aria-hidden>+</span>
          <kbd className="lmx-kbd">Shift</kbd>
          <span aria-hidden>+</span>
          <kbd className="lmx-kbd">Alt</kbd>
          <span aria-hidden>+</span>
          <kbd className="lmx-kbd">M</kbd>
        </span>
      </div>
    </aside>
  );
}
