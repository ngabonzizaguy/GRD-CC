import { canOpenLmx } from '@cco/host/access';
import { create } from 'zustand';

export type LmxPaneId =
  | 'p0'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'p5'
  | 'p6'
  | 'p7'
  | 'p8'
  | 'p9';

interface LmxState {
  isOpen: boolean;
  activeFeature: LmxPaneId;
  mobileNavOpen: boolean;
  open: (feature?: LmxPaneId) => void;
  close: () => void;
  setFeature: (feature: LmxPaneId) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

export const useLmxStore = create<LmxState>((set) => ({
  isOpen: false,
  activeFeature: 'p0',
  mobileNavOpen: false,
  open: (feature = 'p0') => {
    if (!canOpenLmx()) return;
    set({ isOpen: true, activeFeature: feature, mobileNavOpen: false });
  },
  close: () => set({ isOpen: false, mobileNavOpen: false }),
  setFeature: (feature) =>
    set({ activeFeature: feature, mobileNavOpen: false }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}));
