'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CcoShell } from '@cco/components/cco/cco-shell';
import { useIsSuperAdmin } from '@cco/host/context';
import { useCcoStore } from '@cco/stores/cco-store';
import '@cco/theme/cco-theme.css';

export function CcoOverlay({ fontClassName = '' }: { fontClassName?: string }) {
  const { isOpen, close } = useCcoStore();
  const isSuperAdmin = useIsSuperAdmin();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    },
    [isOpen, close]
  );

  useEffect(() => {
    if (isOpen && !isSuperAdmin) {
      close();
    }
  }, [isOpen, isSuperAdmin, close]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !isSuperAdmin || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Control Center Operations"
      data-theme="cco-vercel"
      className={`cco-overlay-root fixed inset-0 z-[200] flex flex-col ${fontClassName}`.trim()}
      style={{ background: 'var(--cco-canvas)' }}
    >
      <CcoShell />
    </div>,
    document.body
  );
}
