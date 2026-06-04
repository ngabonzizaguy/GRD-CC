'use client';

import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { getLmxPane } from '@cco/components/lmx/lmx-panes';
import { useLmxStore } from '@cco/stores/lmx-store';

export function LmxBar() {
  const { activeFeature, close, toggleMobileNav, mobileNavOpen } = useLmxStore();
  const feature = getLmxPane(activeFeature);

  return (
    <header className="lmx-bar">
      <div className="lmx-bar-accent" aria-hidden />
      <button
        type="button"
        className="lmx-icon-btn lmx-focus-ring md:hidden"
        onClick={toggleMobileNav}
        aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="lmx-rail"
        aria-expanded={mobileNavOpen}
      >
        {mobileNavOpen ? (
          <X className="h-5 w-5" strokeWidth={1.75} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>
      <div className="lmx-breadcrumb min-w-0 flex-1">
        <span className="lmx-product-mark">Lmx</span>
        <ChevronRight
          className="lmx-breadcrumb-sep h-3.5 w-3.5 shrink-0"
          strokeWidth={2}
          aria-hidden
        />
        <span className="lmx-breadcrumb-title">{feature.label}</span>
      </div>
      <div className="relative hidden max-w-md flex-1 lg:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--lmx-mute)' }}
          aria-hidden
        />
        <input
          type="search"
          className="lmx-input lmx-focus-ring pl-9"
          placeholder="Search…"
          disabled
          aria-label="Search module (coming soon)"
        />
      </div>
      <button
        type="button"
        className="lmx-btn-ghost lmx-focus-ring flex shrink-0 items-center gap-2"
        onClick={close}
      >
        <X className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Exit</span>
      </button>
    </header>
  );
}
