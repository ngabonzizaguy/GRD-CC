'use client';

import { useEffect, useState } from 'react';
import { Keyboard, Loader2, Save } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import {
  formatShortcutLabel,
  getShortcutConfig,
  saveShortcutConfig,
  type CcoShortcutConfig,
} from '@cco/services/cco/cco-shortcut.service';
import { toast } from 'sonner';

export function CcoShortcutPanel() {
  const [config, setConfig] = useState<CcoShortcutConfig>(() => getShortcutConfig());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(getShortcutConfig());
  }, []);

  const handleSave = () => {
    setSaving(true);
    const result = saveShortcutConfig(config);
    if (result.ok) {
      setConfig(result.data);
      toast.success('Shortcut saved');
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Shortcut access
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Keyboard chord to open this command center (super admin only).
        </p>
      </div>

      <CcoSection
        title="Modifiers & key"
        description="Persisted via cco-shortcut-config (localStorage)"
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
          <CcoField label="Key">
            <input
              className="cco-input max-w-[120px] cco-mono uppercase"
              value={config.key}
              maxLength={20}
              onChange={(e) => setConfig((c) => ({ ...c, key: e.target.value }))}
              placeholder="m"
            />
          </CcoField>
          <button
            type="button"
            className="cco-btn-primary inline-flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save shortcut
          </button>
        </div>
      </CcoSection>

      <div
        className="cco-card rounded-lg border px-5 py-4"
        style={{ borderColor: 'var(--cco-hairline)', background: 'var(--cco-canvas-soft)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wide cco-mono" style={{ color: 'var(--cco-mute)' }}>
          Test hint
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--cco-body)' }}>
          Press{' '}
          <kbd
            className="cco-mono rounded px-2 py-0.5 text-sm font-medium"
            style={{ background: 'var(--cco-canvas)', border: '1px solid var(--cco-hairline)' }}
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
      style={{ borderColor: 'var(--cco-hairline)', color: 'var(--cco-ink)' }}
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

function CcoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--cco-ink)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
