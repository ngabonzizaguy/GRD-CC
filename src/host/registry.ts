import type { LmxBridge } from '@cco/host/types';

let hostAdapter: LmxBridge | null = null;

export function bindLmxBridge(adapter: LmxBridge): void {
  hostAdapter = adapter;
}

export function readLmxBridge(): LmxBridge {
  if (!hostAdapter) {
    throw new Error(
      '@grd/cco: Host not registered. Wrap the app with LmxBindProvider.'
    );
  }
  return hostAdapter;
}

export function tryReadLmxBridge(): LmxBridge | null {
  return hostAdapter;
}
