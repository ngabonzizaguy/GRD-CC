import {
  getFeatureSystemConfig,
  getFeatureVerifyCodes,
  getRequireAdminSelfCredentials,
  getShowSettingsAdminTab,
  setFeatureSystemConfig,
  setFeatureVerifyCodes,
  setRequireAdminSelfCredentials,
  setShowSettingsAdminTab,
} from '@cco/config/main-admin-prefs';
import { recordCcoActivity } from '@cco/services/cco/cco-activity-log';
import type { CcoServiceResult } from '@cco/services/cco/types';

export type CcoDashboardOverrides = {
  showSettingsAdminTab: boolean;
  requireAdminSelfCredentials: boolean;
  featureVerifyCodes: boolean;
  featureSystemConfig: boolean;
};

export function getDashboardOverrides(): CcoServiceResult<CcoDashboardOverrides> {
  return {
    ok: true,
    data: {
      showSettingsAdminTab: getShowSettingsAdminTab(),
      requireAdminSelfCredentials: getRequireAdminSelfCredentials(),
      featureVerifyCodes: getFeatureVerifyCodes(),
      featureSystemConfig: getFeatureSystemConfig(),
    },
  };
}

export function updateDashboardOverrides(
  patch: Partial<CcoDashboardOverrides>
): CcoServiceResult<CcoDashboardOverrides> {
  if (patch.showSettingsAdminTab !== undefined) {
    setShowSettingsAdminTab(patch.showSettingsAdminTab);
  }
  if (patch.requireAdminSelfCredentials !== undefined) {
    setRequireAdminSelfCredentials(patch.requireAdminSelfCredentials);
  }
  if (patch.featureVerifyCodes !== undefined) {
    setFeatureVerifyCodes(patch.featureVerifyCodes);
  }
  if (patch.featureSystemConfig !== undefined) {
    setFeatureSystemConfig(patch.featureSystemConfig);
  }

  recordCcoActivity('cco.dashboard.update', { detail: 'Updated dashboard overrides', ...patch });

  return getDashboardOverrides();
}
