/**
 * Dashboard feature toggles for CCo (localStorage; super_admin via overlay).
 */

const PREFIX = 'gr_main_admin_';

export const SHOW_SETTINGS_ADMIN_TAB_KEY = `${PREFIX}show_settings_admin_tab`;
export const REQUIRE_ADMIN_SELF_CREDENTIALS_KEY = `${PREFIX}require_admin_self_credentials`;

export function getShowSettingsAdminTab(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SHOW_SETTINGS_ADMIN_TAB_KEY) === 'true';
}

export function setShowSettingsAdminTab(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) localStorage.setItem(SHOW_SETTINGS_ADMIN_TAB_KEY, 'true');
  else localStorage.removeItem(SHOW_SETTINGS_ADMIN_TAB_KEY);
}

export function getRequireAdminSelfCredentials(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(REQUIRE_ADMIN_SELF_CREDENTIALS_KEY) === 'true';
}

export function setRequireAdminSelfCredentials(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) localStorage.setItem(REQUIRE_ADMIN_SELF_CREDENTIALS_KEY, 'true');
  else localStorage.removeItem(REQUIRE_ADMIN_SELF_CREDENTIALS_KEY);
}

export const FEATURE_VERIFY_CODES_KEY = `${PREFIX}feature_verify_codes`;
export const FEATURE_SYSTEM_CONFIG_KEY = `${PREFIX}feature_system_config`;

export function getFeatureVerifyCodes(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FEATURE_VERIFY_CODES_KEY) !== 'false';
}

export function setFeatureVerifyCodes(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) localStorage.removeItem(FEATURE_VERIFY_CODES_KEY);
  else localStorage.setItem(FEATURE_VERIFY_CODES_KEY, 'false');
}

export function getFeatureSystemConfig(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FEATURE_SYSTEM_CONFIG_KEY) !== 'false';
}

export function setFeatureSystemConfig(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) localStorage.removeItem(FEATURE_SYSTEM_CONFIG_KEY);
  else localStorage.setItem(FEATURE_SYSTEM_CONFIG_KEY, 'false');
}
