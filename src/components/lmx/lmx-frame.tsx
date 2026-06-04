'use client';

import { useEffect } from 'react';
import { LmxRail } from '@cco/components/lmx/lmx-rail';
import { LmxBar } from '@cco/components/lmx/lmx-bar';
import { LmxBody } from '@cco/components/lmx/lmx-body';
import { useLmxStore } from '@cco/stores/lmx-store';

export function LmxFrame() {
  const { mobileNavOpen, setMobileNavOpen } = useLmxStore();

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <div className="lmx-frame-root">
      <div className="lmx-frame-grid">
        <button
          type="button"
          className="lmx-drawer-backdrop md:hidden lmx-focus-ring"
          data-visible={mobileNavOpen}
          aria-label="Close navigation menu"
          aria-hidden={!mobileNavOpen}
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={() => setMobileNavOpen(false)}
        />
        <div className="lmx-rail-slot">
          <LmxRail />
        </div>
        <div className="lmx-main-column">
          <LmxBar />
          <main className="lmx-main-scroll lmx-pad-responsive">
            <LmxBody />
          </main>
        </div>
      </div>
    </div>
  );
}
