import {
  getFeatureSystemConfig,
  getFeatureVerifyCodes,
  getRequireAdminSelfCredentials,
  getShowSettingsAdminTab,
  getRidesIncomingEnabled,
  setFeatureSystemConfig,
  setFeatureVerifyCodes,
  setRequireAdminSelfCredentials,
  setShowSettingsAdminTab,
  setRidesIncomingEnabled,
} from '@cco/config/main-admin-prefs';
import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, type LmxResult } from '@cco/services/lmx/types';

export type LmxPrefsPatch = {
  showSettingsAdminTab: boolean;
  requireAdminSelfCredentials: boolean;
  featureVerifyCodes: boolean;
  featureSystemConfig: boolean;
  ridesIncomingEnabled: boolean;
};

function readLocal(): LmxPrefsPatch {
  return {
    showSettingsAdminTab: getShowSettingsAdminTab(),
    requireAdminSelfCredentials: getRequireAdminSelfCredentials(),
    featureVerifyCodes: getFeatureVerifyCodes(),
    featureSystemConfig: getFeatureSystemConfig(),
    ridesIncomingEnabled: getRidesIncomingEnabled(),
  };
}

function applyLocal(o: LmxPrefsPatch): void {
  setShowSettingsAdminTab(o.showSettingsAdminTab);
  setRequireAdminSelfCredentials(o.requireAdminSelfCredentials);
  setFeatureVerifyCodes(o.featureVerifyCodes);
  setFeatureSystemConfig(o.featureSystemConfig);
  setRidesIncomingEnabled(o.ridesIncomingEnabled);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lmx-prefs-ping'));
  }
}

function fromApiPayload(raw: {
  show_settings_admin_tab?: boolean;
  require_admin_self_credentials?: boolean;
  feature_verify_codes?: boolean;
  feature_system_config?: boolean;
  rides_incoming_enabled?: boolean;
}): LmxPrefsPatch {
  return {
    showSettingsAdminTab: Boolean(raw.show_settings_admin_tab),
    requireAdminSelfCredentials: Boolean(raw.require_admin_self_credentials),
    featureVerifyCodes: raw.feature_verify_codes !== false,
    featureSystemConfig: raw.feature_system_config !== false,
    ridesIncomingEnabled: raw.rides_incoming_enabled !== false,
  };
}

function toApiPayload(o: LmxPrefsPatch) {
  return {
    show_settings_admin_tab: o.showSettingsAdminTab,
    require_admin_self_credentials: o.requireAdminSelfCredentials,
    feature_verify_codes: o.featureVerifyCodes,
    feature_system_config: o.featureSystemConfig,
    rides_incoming_enabled: o.ridesIncomingEnabled,
  };
}

export async function pullLmxPrefs(): Promise<boolean> {
  const getOverrides = readLmxBridge().api.getDashboardOverrides;
  if (!getOverrides) return false;
  try {
    const res = await getOverrides();
    const mapped = mapLmxRes(res);
    if (!mapped.ok || !mapped.data.overrides) return false;
    const o = fromApiPayload(mapped.data.overrides);
    applyLocal(o);
    return true;
  } catch {
    return false;
  }
}

export function getDashboardOverrides(): LmxResult<LmxPrefsPatch> {
  return { ok: true, data: readLocal() };
}

export async function updateDashboardOverrides(
  patch: Partial<LmxPrefsPatch>
): Promise<LmxResult<LmxPrefsPatch>> {
  const next = { ...readLocal(), ...patch };
  applyLocal(next);

  const putOverrides = readLmxBridge().api.putDashboardOverrides;
  if (putOverrides) {
    try {
      const res = await putOverrides(toApiPayload(next));
      const mapped = mapLmxRes(res);
      if (!mapped.ok) {
        return { ok: false, code: mapped.code, message: mapped.message };
      }
    } catch (e) {
      return {
        ok: false,
        code: 'client_error',
        message: e instanceof Error ? e.message : 'Failed to save dashboard overrides',
      };
    }
  }

  pushLmxAudit('lmx.dashboard.update', { detail: 'Updated dashboard overrides', ...patch });
  return { ok: true, data: next };
}
