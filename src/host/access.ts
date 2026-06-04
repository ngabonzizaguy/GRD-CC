import { tryReadLmxBridge } from '@cco/host/registry';


export function canOpenLmx(): boolean {
  const host = tryReadLmxBridge();
  if (!host) return false;
  return (host.getUser()?.role as string) === 'super_admin';
}
