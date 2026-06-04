import { tryGetCcoHost } from '@cco/host/registry';

/** True only when the host reports role `super_admin` (not shortcut knowledge). */
export function canAccessCco(): boolean {
  const host = tryGetCcoHost();
  if (!host) return false;
  return (host.getUser()?.role as string) === 'super_admin';
}
