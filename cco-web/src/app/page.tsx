'use client';

import { useEffect } from 'react';
import { CcoAppShell } from '@/components/cco-app-shell';
import { useAuthStore } from '@/stores/auth-store';

export default function CcoHomePage() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return <CcoAppShell />;
}
