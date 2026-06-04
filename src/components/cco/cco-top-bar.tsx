'use client';

import { ChevronRight, Menu, Search, X } from 'lucide-react';
import { getCcoFeature } from '@cco/components/cco/cco-features';
import { useCcoStore } from '@cco/stores/cco-store';

export function CcoTopBar() {
  const { activeFeature, close, toggleMobileNav, mobileNavOpen } = useCcoStore();
  const feature = getCcoFeature(activeFeature);

  return (
    <header className="cco-top-bar">
      <div className="cco-top-bar-accent" aria-hidden />
      <button
        type="button"
        className="cco-icon-btn cco-focus-ring md:hidden"
        onClick={toggleMobileNav}
        aria-label="Open navigation menu"
        aria-controls="cco-sidebar"
        aria-expanded={mobileNavOpen}
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>
      <div className="cco-breadcrumb min-w-0 flex-1">
        <span className="cco-product-mark">CCo</span>
        <ChevronRight
          className="cco-breadcrumb-sep h-3.5 w-3.5 shrink-0"
          strokeWidth={2}
          aria-hidden
        />
        <span className="cco-breadcrumb-title">{feature.label}</span>
      </div>
      <div className="relative hidden max-w-md flex-1 lg:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--cco-mute)' }}
          aria-hidden
        />
        <input
          type="search"
          className="cco-input cco-focus-ring pl-9"
          placeholder="Search CCo…"
          disabled
          aria-label="Search CCo (coming soon)"
        />
      </div>
      <button
        type="button"
        className="cco-btn-ghost cco-focus-ring flex shrink-0 items-center gap-2"
        onClick={close}
      >
        <X className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Exit</span>
      </button>
    </header>
  );
}
