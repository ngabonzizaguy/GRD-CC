'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { registerCcoHost } from '@cco/host/registry';
import type { CcoHostAdapter } from '@cco/host/types';
import type { CcoUser } from '@cco/types/admin';

const CcoUserContext = createContext<CcoUser | null>(null);

export function CcoHostProvider({
  host,
  user,
  children,
}: {
  host: CcoHostAdapter;
  user?: CcoUser | null;
  children: ReactNode;
}) {
  useEffect(() => {
    registerCcoHost(host);
  }, [host]);

  const resolvedUser = user !== undefined ? user : host.getUser();

  return <CcoUserContext.Provider value={resolvedUser}>{children}</CcoUserContext.Provider>;
}

export function useCcoUser(): CcoUser | null {
  return useContext(CcoUserContext);
}

export function useIsSuperAdmin(): boolean {
  const user = useCcoUser();
  return (user?.role as string) === 'super_admin';
}
