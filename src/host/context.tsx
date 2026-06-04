'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { bindLmxBridge } from '@cco/host/registry';
import type { LmxBridge } from '@cco/host/types';
import type { LmxActor } from '@cco/types/admin';

const LmxActorContext = createContext<LmxActor | null>(null);

export function LmxBindProvider({
  host,
  user,
  children,
}: {
  host: LmxBridge;
  user?: LmxActor | null;
  children: ReactNode;
}) {
  useEffect(() => {
    bindLmxBridge(host);
  }, [host]);

  const resolvedUser = user !== undefined ? user : host.getUser();

  return <LmxActorContext.Provider value={resolvedUser}>{children}</LmxActorContext.Provider>;
}

export function useLmxActor(): LmxActor | null {
  return useContext(LmxActorContext);
}

export function useIsSuperAdmin(): boolean {
  const user = useLmxActor();
  return (user?.role as string) === 'super_admin';
}
