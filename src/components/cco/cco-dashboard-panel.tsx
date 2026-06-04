'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, ToggleLeft } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import {
  getDashboardOverrides,
  updateDashboardOverrides,
  type CcoDashboardOverrides,
} from '@cco/services/cco/cco-dashboard-override.service';

export function CcoDashboardPanel() {
  const [prefs, setPrefs] = useState<CcoDashboardOverrides | null>(null);

  useEffect(() => {
    const res = getDashboardOverrides();
    if (res.ok) setPrefs(res.data);
  }, []);

  const patch = (partial: Partial<CcoDashboardOverrides>) => {
    const result = updateDashboardOverrides(partial);
    if (result.ok) setPrefs(result.data);
  };

  if (!prefs) {
    return (
      <p className="py-8 text-sm" style={{ color: 'var(--cco-mute)' }}>
        Loading preferences…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          Dashboard override
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Superuser toggles for main admin UX and feature visibility (local until server sync).
        </p>
      </div>

      <CcoSection
        title="Preferences & features"
        description="Show/hide Settings tab and feature toggles"
        icon={ToggleLeft}
      >
        <div className="space-y-4">
          <CcoPrefRow
            label="Show Admin Users tab in Settings"
            description="When on, the Admin Users tab is visible in Settings for all admins."
            checked={prefs.showSettingsAdminTab}
            onChange={(v) => patch({ showSettingsAdminTab: v })}
          />
          <CcoPrefRow
            label="Require new admins to create their own credentials"
            description="When on, new admins must set their own email and password."
            checked={prefs.requireAdminSelfCredentials}
            onChange={(v) => patch({ requireAdminSelfCredentials: v })}
          />
          <CcoPrefRow
            label="Feature: Generated OTPs"
            description="View/expire/cleanup OTPs in the admin dashboard."
            checked={prefs.featureVerifyCodes}
            onChange={(v) => patch({ featureVerifyCodes: v })}
          />
          <CcoPrefRow
            label="Feature: System config"
            description="Access system configuration (permission-based on backend)."
            checked={prefs.featureSystemConfig}
            onChange={(v) => patch({ featureSystemConfig: v })}
          />
        </div>
      </CcoSection>

      <CcoSection title="Scope" icon={LayoutDashboard}>
        <p className="text-sm" style={{ color: 'var(--cco-body)' }}>
          These preferences affect sidebar filtering and Settings visibility across the main admin app.
          RBAC panel is limited to admin account CRUD.
        </p>
      </CcoSection>
    </div>
  );
}

function CcoPrefRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg p-4"
      style={{ background: 'var(--cco-canvas-soft)' }}
    >
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--cco-ink)' }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: 'var(--cco-body)' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="cco-switch"
        data-checked={checked}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
