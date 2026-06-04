'use client';

import { useEffect, useState } from 'react';
import { CCO_FEATURES } from '@cco/components/cco/cco-features';
import { useCcoStore, type CcoFeatureId } from '@cco/stores/cco-store';
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

export function CcoSidebar() {
  const { activeFeature, setFeature, mobileNavOpen } = useCcoStore();
  const isMd = useMinWidthMd();
  const drawerHidden = !isMd && !mobileNavOpen;

  return (
    <aside
      id="cco-sidebar"
      className={cn('cco-sidebar-panel', mobileNavOpen && 'cco-drawer-open')}
      aria-label="Control Center navigation"
      aria-hidden={drawerHidden}
    >
      <div className="border-b px-4 py-4" style={{ borderColor: 'var(--cco-hairline)' }}>
        <div className="flex items-center gap-2">
          <span className="cco-status-dot" data-status="online" aria-hidden />
          <p
            className="cco-mono text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--cco-mute)' }}
          >
            Navigation
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--cco-ink)' }}>
          Command Center
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Features">
        {CCO_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              type="button"
              className="cco-nav-item cco-focus-ring"
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setFeature(feature.id as CcoFeatureId)}
            >
              <Icon className={cn('h-4 w-4 shrink-0')} strokeWidth={1.75} />
              <span className="truncate">{feature.label}</span>
            </button>
          );
        })}
      </nav>
      <div
        className="border-t px-4 py-3 cco-mono"
        style={{ borderColor: 'var(--cco-hairline)', color: 'var(--cco-mute)' }}
      >
        <span className="cco-kbd-group" aria-label="Keyboard shortcut to open CCo">
          <kbd className="cco-kbd">Ctrl</kbd>
          <span aria-hidden>+</span>
          <kbd className="cco-kbd">Shift</kbd>
          <span aria-hidden>+</span>
          <kbd className="cco-kbd">Alt</kbd>
          <span aria-hidden>+</span>
          <kbd className="cco-kbd">M</kbd>
        </span>
      </div>
    </aside>
  );
}
