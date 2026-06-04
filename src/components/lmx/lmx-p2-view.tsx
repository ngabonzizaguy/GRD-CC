'use client';

import { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, Loader2, ToggleLeft } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import { LmxOpsModules } from '@cco/components/lmx/lmx-ops-modules';
import { LmxKycReviews } from '@cco/components/lmx/lmx-kyc-reviews';
import {
  getDashboardOverrides,
  pullLmxPrefs,
  updateDashboardOverrides,
  type LmxPrefsPatch,
} from '@cco/services/lmx/lmx-s2';
import { toast } from 'sonner';

export function LmxP2View() {
  const [prefs, setPrefs] = useState<LmxPrefsPatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    await pullLmxPrefs();
    const res = getDashboardOverrides();
    if (res.ok) setPrefs(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (partial: Partial<LmxPrefsPatch>) => {
    if (!prefs) return;
    setSaving(true);
    const result = await updateDashboardOverrides(partial);
    if (result.ok) {
      setPrefs(result.data);
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  if (loading || !prefs) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--lmx-mute)' }}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading preferences…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Dashboard override
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Superuser toggles for main admin UX and feature visibility (synced to server).
        </p>
      </div>

      <LmxOpsModules />
      <LmxKycReviews />

      <LmxBlock
        title="Preferences & features"
        description="Show/hide Settings tab and feature toggles"
        icon={ToggleLeft}
      >
        <div className="space-y-4">
          <LmxPrefRow
            label="Show Admin Users tab in Settings"
            description="When on, the Admin Users tab is visible in Settings for all admins."
            checked={prefs.showSettingsAdminTab}
            disabled={saving}
            onChange={(v) => patch({ showSettingsAdminTab: v })}
          />
          <LmxPrefRow
            label="Require new admins to create their own credentials"
            description="When on, new admins must set their own email and password."
            checked={prefs.requireAdminSelfCredentials}
            disabled={saving}
            onChange={(v) => patch({ requireAdminSelfCredentials: v })}
          />
          <LmxPrefRow
            label="Feature: Generated OTPs"
            description="View/expire/cleanup OTPs in the admin dashboard."
            checked={prefs.featureVerifyCodes}
            disabled={saving}
            onChange={(v) => patch({ featureVerifyCodes: v })}
          />
          <LmxPrefRow
            label="Feature: System config"
            description="Access system configuration (permission-based on backend)."
            checked={prefs.featureSystemConfig}
            disabled={saving}
            onChange={(v) => patch({ featureSystemConfig: v })}
          />
        </div>
      </LmxBlock>

      <LmxBlock title="Scope" icon={LayoutDashboard}>
        <p className="text-sm" style={{ color: 'var(--lmx-body)' }}>
          These preferences affect sidebar filtering and Settings visibility across the main admin app.
          Access Control is limited to actor registry CRUD.
        </p>
      </LmxBlock>
    </div>
  );
}

function LmxPrefRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg p-4"
      style={{ background: 'var(--lmx-canvas-soft)' }}
    >
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--lmx-ink)' }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: 'var(--lmx-body)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="lmx-switch"
        data-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
