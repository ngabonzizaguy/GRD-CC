/**
 * CCo shortcut configuration (localStorage-backed).
 * Default: Ctrl+Alt+Shift+M per CCo brief.
 */

export const CCO_SHORTCUT_STORAGE_KEY = 'gr_cco_shortcut';

export type CcoShortcutConfig = {
  ctrlOrMeta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

export function getDefaultShortcut(): CcoShortcutConfig {
  return {
    ctrlOrMeta: true,
    shift: true,
    alt: true,
    key: 'm',
  };
}

function parseStoredShortcut(raw: string | null): CcoShortcutConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CcoShortcutConfig>;
    if (typeof parsed.key !== 'string' || !parsed.key.trim()) return null;
    return {
      ctrlOrMeta: parsed.ctrlOrMeta ?? true,
      shift: parsed.shift ?? false,
      alt: parsed.alt ?? false,
      key: parsed.key.trim(),
    };
  } catch {
    return null;
  }
}

export function getCcoShortcutConfig(): CcoShortcutConfig {
  if (typeof window === 'undefined') return getDefaultShortcut();
  return parseStoredShortcut(localStorage.getItem(CCO_SHORTCUT_STORAGE_KEY)) ?? getDefaultShortcut();
}

export function setCcoShortcutConfig(config: CcoShortcutConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CCO_SHORTCUT_STORAGE_KEY, JSON.stringify(config));
}

export function isCcoShortcut(e: KeyboardEvent): boolean {
  const config = getCcoShortcutConfig();
  const metaOrCtrl = e.ctrlKey || e.metaKey;
  if (config.ctrlOrMeta && !metaOrCtrl) return false;
  if (config.shift && !e.shiftKey) return false;
  if (config.alt && !e.altKey) return false;
  if (e.key?.toLowerCase() !== config.key.toLowerCase()) return false;
  return true;
}
