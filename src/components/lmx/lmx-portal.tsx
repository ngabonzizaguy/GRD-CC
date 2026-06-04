'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LmxFrame } from '@cco/components/lmx/lmx-frame';
import { useIsSuperAdmin } from '@cco/host/context';
import { useLmxStore } from '@cco/stores/lmx-store';
import '@cco/theme/lmx-theme.css';

export function LmxPortal({ fontClassName = '' }: { fontClassName?: string }) {
  const { isOpen, close } = useLmxStore();
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
      aria-label="Lmx module"
      data-theme="lmx-v1"
      className={`lmx-portal-root flex flex-col ${fontClassName}`.trim()}
      style={{ background: 'var(--lmx-canvas)' }}
    >
      <LmxFrame />
    </div>,
    document.body
  );
}
