import {
  getCcoShortcutConfig,
  getDefaultShortcut,
  setCcoShortcutConfig,
  type CcoShortcutConfig,
} from '@cco/config/cco-shortcut-config';
import { recordCcoActivity } from '@cco/services/cco/cco-activity-log';
import type { CcoServiceResult } from '@cco/services/cco/types';

export type { CcoShortcutConfig };

export function getShortcutConfig(): CcoShortcutConfig {
  return getCcoShortcutConfig();
}

export function saveShortcutConfig(config: CcoShortcutConfig): CcoServiceResult<CcoShortcutConfig> {
  const validated = validateShortcut(config);
  if (!validated.ok) return validated;

  setCcoShortcutConfig(validated.data);
  recordCcoActivity('cco.shortcut.update', {
    detail: `Updated shortcut to ${formatShortcut(validated.data)}`,
  });

  return { ok: true, data: validated.data };
}

export function validateShortcut(config: CcoShortcutConfig): CcoServiceResult<CcoShortcutConfig> {
  const key = config.key?.trim();
  if (!key) {
    return { ok: false, code: 'invalid_key', message: 'Shortcut key is required' };
  }

  if (!config.ctrlOrMeta && !config.shift && !config.alt) {
    return {
      ok: false,
      code: 'invalid_modifiers',
      message: 'At least one modifier (Ctrl/Cmd, Shift, or Alt) is required',
    };
  }

  if (key.length > 20) {
    return { ok: false, code: 'invalid_key', message: 'Shortcut key is too long' };
  }

  return {
    ok: true,
    data: {
      ctrlOrMeta: Boolean(config.ctrlOrMeta),
      shift: Boolean(config.shift),
      alt: Boolean(config.alt),
      key,
    },
  };
}

export function resetShortcutConfig(): CcoServiceResult<CcoShortcutConfig> {
  const defaults = getDefaultShortcut();
  setCcoShortcutConfig(defaults);
  recordCcoActivity('cco.shortcut.reset', { detail: 'Restored default shortcut' });
  return { ok: true, data: defaults };
}

function formatShortcut(config: CcoShortcutConfig): string {
  const parts: string[] = [];
  if (config.ctrlOrMeta) parts.push('Ctrl/Cmd');
  if (config.shift) parts.push('Shift');
  if (config.alt) parts.push('Alt');
  parts.push(config.key.toUpperCase());
  return parts.join('+');
}

export function formatShortcutLabel(config: CcoShortcutConfig): string {
  return formatShortcut(config);
}
