import type { CcoHostAdapter } from '@cco/host/types';

let hostAdapter: CcoHostAdapter | null = null;

export function registerCcoHost(adapter: CcoHostAdapter): void {
  hostAdapter = adapter;
}

export function getCcoHost(): CcoHostAdapter {
  if (!hostAdapter) {
    throw new Error(
      '@grd/cco: Host not registered. Wrap the app with CcoHostProvider and pass createGreenrideCcoHost() from the admin app.'
    );
  }
  return hostAdapter;
}

export function tryGetCcoHost(): CcoHostAdapter | null {
  return hostAdapter;
}
