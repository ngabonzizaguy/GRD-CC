'use client';

import { useEffect, useState } from 'react';
import { Database, Loader2, Save, Settings2 } from 'lucide-react';
import type { SystemConfigUpdate } from '@cco/types/admin';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import type { LmxEnvRow } from '@cco/host/types';
import { listEnvRegistry, saveEnvRegistry } from '@cco/services/lmx/lmx-s3b';
import { fetchSystemConfig, listPublicEnvVars, patchSystemConfig } from '@cco/services/lmx/lmx-s3a';
import { toast } from 'sonner';

type SafeConfigForm = {
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_phone: string;
  update_notice_enabled: boolean;
  update_notice_title: string;
  update_notice_message: string;
  force_update_enabled: boolean;
  minimum_app_version: string;
  latest_app_version: string;
  android_store_url: string;
  ios_store_url: string;
  alternative_auth_enabled: boolean;
  redesign_enabled: boolean;
  map_provider: 'mapbox' | 'google' | 'osm';
  ai_enabled: boolean;
  ai_chat_enabled: boolean;
  ai_suggestions_enabled: boolean;
  ai_trip_summary_enabled: boolean;
  ai_safety_monitor_enabled: boolean;
  otp_validity_minutes: number;
};

const defaultForm: SafeConfigForm = {
  maintenance_mode: false,
  maintenance_message: '',
  maintenance_phone: '',
  update_notice_enabled: false,
  update_notice_title: '',
  update_notice_message: '',
  force_update_enabled: false,
  minimum_app_version: '',
  latest_app_version: '',
  android_store_url: '',
  ios_store_url: '',
  alternative_auth_enabled: true,
  redesign_enabled: false,
  map_provider: 'mapbox',
  ai_enabled: false,
  ai_chat_enabled: false,
  ai_suggestions_enabled: false,
  ai_trip_summary_enabled: false,
  ai_safety_monitor_enabled: false,
  otp_validity_minutes: 5,
};

export function LmxP3View() {
  const [form, setForm] = useState<SafeConfigForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registry, setRegistry] = useState<LmxEnvRow[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [registrySaving, setRegistrySaving] = useState(false);
  const publicEnv = listPublicEnvVars();

  const loadRegistry = async () => {
    setRegistryLoading(true);
    const res = await listEnvRegistry();
    if (res.ok) {
      setRegistry(res.data);
    } else {
      toast.error(res.message);
    }
    setRegistryLoading(false);
  };

  useEffect(() => {
    void loadRegistry();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetchSystemConfig();
      if (res.ok && res.data) {
        const d = res.data;
        setForm({
          maintenance_mode: Boolean(d.maintenance_mode),
          maintenance_message: String(d.maintenance_message ?? ''),
          maintenance_phone: String(d.maintenance_phone ?? ''),
          update_notice_enabled: Boolean(d.update_notice_enabled),
          update_notice_title: String(d.update_notice_title ?? ''),
          update_notice_message: String(d.update_notice_message ?? ''),
          force_update_enabled: Boolean(d.force_update_enabled),
          minimum_app_version: String(d.minimum_app_version ?? ''),
          latest_app_version: String(d.latest_app_version ?? ''),
          android_store_url: String(d.android_store_url ?? ''),
          ios_store_url: String(d.ios_store_url ?? ''),
          alternative_auth_enabled: d.alternative_auth_enabled !== false,
          redesign_enabled: Boolean(d.redesign_enabled),
          map_provider: (d.map_provider as SafeConfigForm['map_provider']) || 'mapbox',
          ai_enabled: Boolean(d.ai_enabled),
          ai_chat_enabled: Boolean(d.ai_chat_enabled ?? false),
          ai_suggestions_enabled: Boolean(d.ai_suggestions_enabled ?? false),
          ai_trip_summary_enabled: Boolean(d.ai_trip_summary_enabled ?? false),
          ai_safety_monitor_enabled: Boolean(d.ai_safety_monitor_enabled ?? false),
          otp_validity_minutes: Number(d.otp_validity_minutes ?? 5),
        });
      }
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof SafeConfigForm>(key: K, value: SafeConfigForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await patchSystemConfig(form);
    if (result.ok) {
      toast.success('System config saved');
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  const setRegistryEntry = (index: number, patch: Partial<LmxEnvRow>) => {
    setRegistry((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleSaveRegistry = async () => {
    setRegistrySaving(true);
    const res = await saveEnvRegistry(registry);
    if (res.ok) {
      setRegistry(res.data);
      toast.success('Env registry saved');
    } else {
      toast.error(res.message);
    }
    setRegistrySaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: 'var(--lmx-mute)' }}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading runtime config…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          Environment
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Safe runtime fields via API. Secret keys are managed under IP &amp; secrets (metadata only).
        </p>
      </div>

      <LmxBlock title="Runtime system config" description="POST /system/config (safe subset)" icon={Settings2}>
        <div className="grid gap-4 lg:grid-cols-2">
          <BoolRow label="Maintenance mode" checked={!!form.maintenance_mode} onChange={(v) => set('maintenance_mode', v)} />
          <BoolRow label="Update notice" checked={!!form.update_notice_enabled} onChange={(v) => set('update_notice_enabled', v)} />
          <BoolRow label="Force update" checked={!!form.force_update_enabled} onChange={(v) => set('force_update_enabled', v)} />
          <BoolRow label="Alternative auth" checked={!!form.alternative_auth_enabled} onChange={(v) => set('alternative_auth_enabled', v)} />
          <BoolRow label="Redesign enabled" checked={!!form.redesign_enabled} onChange={(v) => set('redesign_enabled', v)} />
          <BoolRow label="AI enabled" checked={!!form.ai_enabled} onChange={(v) => set('ai_enabled', v)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Maintenance message">
            <textarea className="lmx-input min-h-[72px]" value={form.maintenance_message} onChange={(e) => set('maintenance_message', e.target.value)} />
          </Field>
          <Field label="Maintenance phone">
            <input className="lmx-input" value={form.maintenance_phone} onChange={(e) => set('maintenance_phone', e.target.value)} />
          </Field>
          <Field label="Min app version">
            <input className="lmx-input lmx-mono" value={form.minimum_app_version} onChange={(e) => set('minimum_app_version', e.target.value)} />
          </Field>
          <Field label="Latest app version">
            <input className="lmx-input lmx-mono" value={form.latest_app_version} onChange={(e) => set('latest_app_version', e.target.value)} />
          </Field>
          <Field label="Map provider">
            <select
              className="lmx-input"
              value={form.map_provider}
              onChange={(e) => set('map_provider', e.target.value as SafeConfigForm['map_provider'])}
            >
              <option value="mapbox">Mapbox</option>
              <option value="google">Google</option>
              <option value="osm">OSM</option>
            </select>
          </Field>
          <Field label="OTP validity (minutes)">
            <input
              type="number"
              className="lmx-input lmx-mono"
              value={form.otp_validity_minutes ?? 5}
              onChange={(e) => set('otp_validity_minutes', Number(e.target.value) || 5)}
            />
          </Field>
        </div>
        <button type="button" className="lmx-btn-primary mt-6 inline-flex items-center gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save runtime config
        </button>
      </LmxBlock>

      <LmxBlock title="Env registry" description="Build and runtime keys stored on server" icon={Database}>
        {registryLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm" style={{ color: 'var(--lmx-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading registry…
          </div>
        ) : registry.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--lmx-mute)' }}>
            No registry entries configured yet.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className="border-b lmx-mono text-xs uppercase tracking-wide"
                    style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}
                  >
                    <th className="py-2 pr-3 font-medium">Key</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium">Label</th>
                    <th className="py-2 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {registry.map((entry, index) => (
                    <tr key={entry.key} className="border-b" style={{ borderColor: 'var(--lmx-hairline)' }}>
                      <td className="py-2.5 pr-3 lmx-mono text-xs" style={{ color: 'var(--lmx-ink)' }}>
                        {entry.key}
                      </td>
                      <td className="py-2.5 pr-3 text-xs" style={{ color: 'var(--lmx-mute)' }}>
                        {entry.category}
                      </td>
                      <td className="py-2.5 pr-3">
                        <input
                          className="lmx-input min-w-[120px]"
                          value={entry.label ?? ''}
                          onChange={(e) => setRegistryEntry(index, { label: e.target.value })}
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type={entry.is_secret ? 'password' : 'text'}
                          className="lmx-input min-w-[200px] lmx-mono text-xs"
                          value={entry.value ?? ''}
                          readOnly={entry.category === 'build'}
                          onChange={(e) => setRegistryEntry(index, { value: e.target.value })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="lmx-btn-primary mt-4 inline-flex items-center gap-2"
              disabled={registrySaving}
              onClick={() => void handleSaveRegistry()}
            >
              {registrySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save env registry
            </button>
          </>
        )}
      </LmxBlock>

      <LmxBlock title="NEXT_PUBLIC (read-only)" description="Build-time public env — change in Vercel / .env">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b lmx-mono text-xs uppercase tracking-wide" style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}>
                <th className="py-2 pr-4 font-medium">Key</th>
                <th className="py-2 pr-4 font-medium">Value</th>
                <th className="py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {publicEnv.map((row: { key: string; value: string; source: string }) => (
                <tr key={row.key} className="border-b" style={{ borderColor: 'var(--lmx-hairline)' }}>
                  <td className="py-2.5 pr-4 lmx-mono" style={{ color: 'var(--lmx-ink)' }}>
                    {row.key}
                  </td>
                  <td className="py-2.5 pr-4 lmx-mono" style={{ color: 'var(--lmx-body)' }}>
                    {row.value}
                  </td>
                  <td className="py-2.5 text-xs" style={{ color: 'var(--lmx-mute)' }}>
                    {row.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LmxBlock>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--lmx-ink)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function BoolRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--lmx-canvas-soft)' }}>
      <span className="text-sm" style={{ color: 'var(--lmx-ink)' }}>
        {label}
      </span>
      <button type="button" role="switch" aria-checked={checked} className="lmx-switch" data-checked={checked} onClick={() => onChange(!checked)} />
    </div>
  );
}
