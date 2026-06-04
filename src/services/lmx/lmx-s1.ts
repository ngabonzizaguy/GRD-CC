import {
  getLmxChordCfg,
  defaultLmxChord,
  setLmxChordCfg,
  type LmxChordCfg,
} from '@cco/config/lmx-chord';
import { readLmxBridge } from '@cco/host/registry';
import { pushLmxAudit } from '@cco/services/lmx/lmx-audit-push';
import { mapLmxRes, type LmxResult } from '@cco/services/lmx/types';

export type { LmxChordCfg };

export function getShortcutConfig(): LmxChordCfg {
  return getLmxChordCfg();
}

export async function pullLmxChord(): Promise<boolean> {
  const getShortcut = readLmxBridge().api.getShortcut;
  if (!getShortcut) return false;
  try {
    const res = await getShortcut();
    const mapped = mapLmxRes(res);
    if (!mapped.ok || !mapped.data.config) return false;
    const c = mapped.data.config;
    setLmxChordCfg({
      ctrlOrMeta: Boolean(c.ctrlOrMeta),
      shift: Boolean(c.shift),
      alt: Boolean(c.alt),
      key: String(c.key || 'm').toLowerCase(),
    });
    return true;
  } catch {
    return false;
  }
}

export async function saveShortcutConfig(
  config: LmxChordCfg
): Promise<LmxResult<LmxChordCfg>> {
  const validated = validateShortcut(config);
  if (!validated.ok) return validated;

  const putShortcut = readLmxBridge().api.putShortcut;
  if (putShortcut) {
    try {
      const res = await putShortcut(validated.data);
      const mapped = mapLmxRes(res);
      if (!mapped.ok) {
        return { ok: false, code: mapped.code, message: mapped.message };
      }
    } catch (e) {
      return {
        ok: false,
        code: 'client_error',
        message: e instanceof Error ? e.message : 'Failed to save shortcut',
      };
    }
  }

  setLmxChordCfg(validated.data);
  pushLmxAudit('lmx.shortcut.update', {
    detail: `Updated shortcut to ${formatShortcut(validated.data)}`,
  });

  return { ok: true, data: validated.data };
}

export function validateShortcut(config: LmxChordCfg): LmxResult<LmxChordCfg> {
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
      key: key.toLowerCase(),
    },
  };
}

export async function resetShortcutConfig(): Promise<LmxResult<LmxChordCfg>> {
  const defaults = defaultLmxChord();
  return saveShortcutConfig(defaults);
}

function formatShortcut(config: LmxChordCfg): string {
  const parts: string[] = [];
  if (config.ctrlOrMeta) parts.push('Ctrl/Cmd');
  if (config.shift) parts.push('Shift');
  if (config.alt) parts.push('Alt');
  parts.push(config.key.toUpperCase());
  return parts.join('+');
}

export function formatShortcutLabel(config: LmxChordCfg): string {
  return formatShortcut(config);
}
