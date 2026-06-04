'use client';

import { CcoActivityPanel } from '@cco/components/cco/cco-activity-panel';
import { CcoConnectionPanel } from '@cco/components/cco/cco-connection-panel';
import { CcoDashboardPanel } from '@cco/components/cco/cco-dashboard-panel';
import { CcoEnvPanel } from '@cco/components/cco/cco-env-panel';
import { CcoLogsPanel } from '@cco/components/cco/cco-logs-panel';
import { CcoOverviewPanel } from '@cco/components/cco/cco-overview-panel';
import { CcoRbacPanel } from '@cco/components/cco/cco-rbac-panel';
import { CcoSecretsPanel } from '@cco/components/cco/cco-secrets-panel';
import { CcoShortcutPanel } from '@cco/components/cco/cco-shortcut-panel';
import { CcoSidebarPanel } from '@cco/components/cco/cco-sidebar-panel';
import { useCcoStore, type CcoFeatureId } from '@cco/stores/cco-store';

const PANEL_BY_FEATURE: Record<CcoFeatureId, React.ComponentType> = {
  overview: CcoOverviewPanel,
  shortcut: CcoShortcutPanel,
  dashboard: CcoDashboardPanel,
  env: CcoEnvPanel,
  rbac: () => <CcoRbacPanel embedded />,
  sidebar: CcoSidebarPanel,
  secrets: CcoSecretsPanel,
  connection: CcoConnectionPanel,
  logs: CcoLogsPanel,
  activity: CcoActivityPanel,
};

export function CcoContentPanel() {
  const activeFeature = useCcoStore((s) => s.activeFeature);
  const Panel = PANEL_BY_FEATURE[activeFeature] ?? CcoOverviewPanel;
  return <Panel />;
}
