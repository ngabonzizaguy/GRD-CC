

export const LMX_CHORD_K = 'gr_lmx_c';

export type LmxChordCfg = {
  ctrlOrMeta: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
};

export function defaultLmxChord(): LmxChordCfg {
  return {
    ctrlOrMeta: true,
    shift: true,
    alt: true,
    key: 'm',
  };
}

function parseStoredShortcut(raw: string | null): LmxChordCfg | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LmxChordCfg>;
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

export function getLmxChordCfg(): LmxChordCfg {
  if (typeof window === 'undefined') return defaultLmxChord();
  return parseStoredShortcut(localStorage.getItem(LMX_CHORD_K)) ?? defaultLmxChord();
}

export function setLmxChordCfg(config: LmxChordCfg): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LMX_CHORD_K, JSON.stringify(config));
}

export function isLmxChord(e: KeyboardEvent): boolean {
  const config = getLmxChordCfg();
  const metaOrCtrl = e.ctrlKey || e.metaKey;
  if (config.ctrlOrMeta && !metaOrCtrl) return false;
  if (config.shift && !e.shiftKey) return false;
  if (config.alt && !e.altKey) return false;
  if (e.key?.toLowerCase() !== config.key.toLowerCase()) return false;
  return true;
}
