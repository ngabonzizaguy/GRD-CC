'use client';

import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Loader2, Save } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import {
  formatShortcutLabel,
  getShortcutConfig,
  pullLmxChord,
  saveShortcutConfig,
  type LmxChordCfg,
} from '@cco/services/lmx/lmx-s1';
import { toast } from 'sonner';

export function LmxP1View() {
  const [config, setConfig] = useState<LmxChordCfg>(() => getShortcutConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    await pullLmxChord();
    setConfig(getShortcutConfig());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveShortcutConfig(config);
    if (result.ok) {
      setConfig(result.data);
      toast.success('Shortcut saved');
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--lmx-mute)' }}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading shortcut…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Shortcut access
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Keyboard chord to open this command center (super admin only).
        </p>
      </div>

      <LmxBlock
        title="Modifiers & key"
        description="Persisted locally and synced to server"
        icon={Keyboard}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <ModifierToggle
              label="Ctrl / ⌘"
              checked={config.ctrlOrMeta}
              onChange={(v) => setConfig((c) => ({ ...c, ctrlOrMeta: v }))}
            />
            <ModifierToggle
              label="Shift"
              checked={config.shift}
              onChange={(v) => setConfig((c) => ({ ...c, shift: v }))}
            />
            <ModifierToggle
              label="Alt"
              checked={config.alt}
              onChange={(v) => setConfig((c) => ({ ...c, alt: v }))}
            />
          </div>
          <LmxField label="Key">
            <input
              className="lmx-input max-w-[120px] lmx-mono uppercase"
              value={config.key}
              maxLength={20}
              onChange={(e) => setConfig((c) => ({ ...c, key: e.target.value }))}
              placeholder="m"
            />
          </LmxField>
          <button
            type="button"
            className="lmx-btn-primary inline-flex items-center gap-2"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save shortcut
          </button>
        </div>
      </LmxBlock>

      <div
        className="lmx-card rounded-lg border px-5 py-4"
        style={{ borderColor: 'var(--lmx-hairline)', background: 'var(--lmx-canvas-soft)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wide lmx-mono" style={{ color: 'var(--lmx-mute)' }}>
          Test hint
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Press{' '}
          <kbd
            className="lmx-mono rounded px-2 py-0.5 text-sm font-medium"
            style={{ background: 'var(--lmx-canvas)', border: '1px solid var(--lmx-hairline)' }}
          >
            {formatShortcutLabel(config)}
          </kbd>{' '}
          from any dashboard route while signed in as super admin.
        </p>
      </div>
    </div>
  );
}

function ModifierToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm"
      style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-ink)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

function LmxField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
