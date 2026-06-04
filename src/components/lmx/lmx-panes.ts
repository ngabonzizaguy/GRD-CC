import type { LmxPaneId } from '@cco/stores/lmx-store';
import {
  Activity,
  Cable,
  KeyRound,
  LayoutDashboard,
  LayoutList,
  Lock,
  ScrollText,
  Settings2,
  Shield,
  Keyboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LmxPaneDef {
  id: LmxPaneId;
  label: string;
  description: string;
  icon: LucideIcon;
  phase: number;
}

export const LMX_PANES: LmxPaneDef[] = [
  { id: 'p0', label: 'P0', description: 'Home', icon: Shield, phase: 0 },
  { id: 'p1', label: 'P1', description: 'Entry chord', icon: Keyboard, phase: 2 },
  { id: 'p2', label: 'P2', description: 'Layout prefs', icon: LayoutDashboard, phase: 2 },
  { id: 'p3', label: 'P3', description: 'Runtime cfg', icon: Settings2, phase: 3 },
  { id: 'p4', label: 'P4', description: 'Policy', icon: KeyRound, phase: 1 },
  { id: 'p5', label: 'P5', description: 'Nav layout', icon: LayoutList, phase: 4 },
  { id: 'p6', label: 'P6', description: 'Vault', icon: Lock, phase: 5 },
  { id: 'p7', label: 'P7', description: 'Link status', icon: Cable, phase: 5 },
  { id: 'p8', label: 'P8', description: 'Stream', icon: ScrollText, phase: 6 },
  { id: 'p9', label: 'P9', description: 'Trace', icon: Activity, phase: 6 },
];

export function getLmxPane(id: LmxPaneId): LmxPaneDef {
  return LMX_PANES.find((f) => f.id === id) ?? LMX_PANES[0];
}
