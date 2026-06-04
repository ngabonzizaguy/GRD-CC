import { canAccessCco } from '@cco/host/access';
import { create } from 'zustand';

export type CcoFeatureId =
  | 'overview'
  | 'shortcut'
  | 'dashboard'
  | 'env'
  | 'rbac'
  | 'sidebar'
  | 'secrets'
  | 'connection'
  | 'logs'
  | 'activity';

interface CcoState {
  isOpen: boolean;
  activeFeature: CcoFeatureId;
  mobileNavOpen: boolean;
  open: (feature?: CcoFeatureId) => void;
  close: () => void;
  setFeature: (feature: CcoFeatureId) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

export const useCcoStore = create<CcoState>((set) => ({
  isOpen: false,
  activeFeature: 'overview',
  mobileNavOpen: false,
  open: (feature = 'overview') => {
    if (!canAccessCco()) return;
    set({ isOpen: true, activeFeature: feature, mobileNavOpen: false });
  },
  close: () => set({ isOpen: false, mobileNavOpen: false }),
  setFeature: (feature) =>
    set({ activeFeature: feature, mobileNavOpen: false }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}));
