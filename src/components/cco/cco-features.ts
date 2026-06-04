import type { CcoFeatureId } from '@cco/stores/cco-store';
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

export interface CcoFeatureDef {
  id: CcoFeatureId;
  label: string;
  description: string;
  icon: LucideIcon;
  phase: number;
}

export const CCO_FEATURES: CcoFeatureDef[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'CCo control center home',
    icon: Shield,
    phase: 0,
  },
  {
    id: 'shortcut',
    label: 'Shortcut access',
    description: 'Keyboard entry and shortcut settings',
    icon: Keyboard,
    phase: 2,
  },
  {
    id: 'dashboard',
    label: 'Dashboard override',
    description: 'Superuser dashboard and feature toggles',
    icon: LayoutDashboard,
    phase: 2,
  },
  {
    id: 'env',
    label: 'Environment',
    description: 'Environment variables and config',
    icon: Settings2,
    phase: 3,
  },
  {
    id: 'rbac',
    label: 'RBAC',
    description: 'Roles, permissions, admin accounts',
    icon: KeyRound,
    phase: 1,
  },
  {
    id: 'sidebar',
    label: 'Sidebar menu',
    description: 'Navigation structure CRUD',
    icon: LayoutList,
    phase: 4,
  },
  {
    id: 'secrets',
    label: 'IP & secrets',
    description: 'Allowlists and secret metadata',
    icon: Lock,
    phase: 5,
  },
  {
    id: 'connection',
    label: 'Connections',
    description: 'App ↔ server connectivity',
    icon: Cable,
    phase: 5,
  },
  {
    id: 'logs',
    label: 'System logs',
    description: 'Operational log viewer',
    icon: ScrollText,
    phase: 6,
  },
  {
    id: 'activity',
    label: 'Activity log',
    description: 'Privileged action audit trail',
    icon: Activity,
    phase: 6,
  },
];

export function getCcoFeature(id: CcoFeatureId): CcoFeatureDef {
  return CCO_FEATURES.find((f) => f.id === id) ?? CCO_FEATURES[0];
}
