'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LmxBindProvider,
  LmxPortal,
  pullLmxRemote,
  useLmxStore,
} from '@grd/cco';
import { createCcoWebHost } from '@/lib/host-bridge';
import { useAuthStore } from '@/stores/auth-store';

function LmxBootstrap() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const open = useLmxStore((s) => s.open);
  const isOpen = useLmxStore((s) => s.isOpen);

  useEffect(() => {
    void pullLmxRemote();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.role !== 'super_admin') {
      useAuthStore.getState().logout();
      router.replace('/login?error=super_admin_only');
      return;
    }
    if (!isOpen) {
      open('p0');
    }
  }, [isLoading, isAuthenticated, user?.role, isOpen, open, router]);

  return null;
}

export function CcoAppShell() {
  const user = useAuthStore((s) => s.user);
  const host = useMemo(() => createCcoWebHost(), []);

  const shellUser = user
    ? {
        admin_id: (user as { admin_id?: string }).admin_id,
        role: user.role as string | undefined,
        email: user.email,
        username: (user as { username?: string }).username,
        full_name: (user as { full_name?: string }).full_name,
      }
    : null;

  return (
    <LmxBindProvider host={host} user={shellUser}>
      <LmxBootstrap />
      <LmxPortal />
    </LmxBindProvider>
  );
}
