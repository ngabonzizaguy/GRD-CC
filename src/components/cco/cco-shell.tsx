'use client';

import { useEffect } from 'react';
import { CcoSidebar } from '@cco/components/cco/cco-sidebar';
import { CcoTopBar } from '@cco/components/cco/cco-top-bar';
import { CcoContentPanel } from '@cco/components/cco/cco-content-panel';
import { useCcoStore } from '@cco/stores/cco-store';

export function CcoShell() {
  const { mobileNavOpen, setMobileNavOpen } = useCcoStore();

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
    <div className="cco-shell-root">
      <div className="cco-shell-grid">
        <button
          type="button"
          className="cco-drawer-backdrop md:hidden cco-focus-ring"
          data-visible={mobileNavOpen}
          aria-label="Close navigation menu"
          aria-hidden={!mobileNavOpen}
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={() => setMobileNavOpen(false)}
        />
        <div className="cco-sidebar-slot">
          <CcoSidebar />
        </div>
        <div className="cco-main-column">
          <CcoTopBar />
          <main className="cco-main-scroll cco-pad-responsive">
            <CcoContentPanel />
          </main>
        </div>
      </div>
    </div>
  );
}
