'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Lock, Save, Shield } from 'lucide-react';
import { LmxBlock } from '@cco/components/lmx/lmx-block';
import {
  getIPAllowlist,
  saveIPAllowlist,
} from '@cco/services/lmx/lmx-s6b';
import {
  getSecretsMetadata,
  updateSecrets,
  type LmxVaultRow,
} from '@cco/services/lmx/lmx-s6a';
import { toast } from 'sonner';

export function LmxP6View() {
  const [rows, setRows] = useState<LmxVaultRow[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  const [allowlistText, setAllowlistText] = useState('');
  const [allowlistEnabled, setAllowlistEnabled] = useState(true);
  const [allowlistLoading, setAllowlistLoading] = useState(true);
  const [allowlistSaving, setAllowlistSaving] = useState(false);

  const loadSecrets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getSecretsMetadata();
    if (res.ok) {
      setRows(res.data.secrets);
      setValues({});
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, []);

  const loadAllowlist = useCallback(async () => {
    setAllowlistLoading(true);
    const res = await getIPAllowlist();
    if (res.ok) {
      setAllowlistText(res.data.allowlist.join('\n'));
      setAllowlistEnabled(res.data.enabled);
    } else {
      toast.error(res.message);
    }
    setAllowlistLoading(false);
  }, []);

  useEffect(() => {
    void loadSecrets();
    void loadAllowlist();
  }, [loadSecrets, loadAllowlist]);

  const saveRow = async (key: string) => {
    const value = values[key]?.trim();
    if (!value) {
      toast.error('Enter a new value to save');
      return;
    }
    setSavingKey(key);
    const res = await updateSecrets({ [key]: value });
    if (res.ok) {
      toast.success(`Saved ${key}`);
      setValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await loadSecrets();
    } else {
      toast.error(res.message);
    }
    setSavingKey(null);
  };

  const saveAll = async () => {
    const updates: Record<string, string> = {};
    for (const row of rows) {
      const v = values[row.key]?.trim();
      if (v) updates[row.key] = v;
    }
    if (Object.keys(updates).length === 0) {
      toast.error('Enter at least one new value');
      return;
    }
    setSavingAll(true);
    const res = await updateSecrets(updates);
    if (res.ok) {
      toast.success('Secrets saved');
      setValues({});
      await loadSecrets();
    } else {
      toast.error(res.message);
    }
    setSavingAll(false);
  };

  const saveAllowlist = async () => {
    const allowlist = allowlistText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    setAllowlistSaving(true);
    const res = await saveIPAllowlist(allowlist, allowlistEnabled);
    if (res.ok) {
      toast.success('IP allowlist saved');
      setAllowlistText(res.data.allowlist.join('\n'));
      setAllowlistEnabled(res.data.enabled);
    } else {
      toast.error(res.message);
    }
    setAllowlistSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--lmx-ink)' }}>
          IP &amp; secrets
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--lmx-body)' }}>
          Rotate deployment secrets and restrict admin access by IP.
        </p>
      </div>

      <LmxBlock title="Secret inventory" description="Update values; fingerprints refresh after save" icon={Lock}>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--lmx-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading metadata…
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: 'var(--lmx-error)' }}>
            {error}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className="border-b text-xs uppercase tracking-wide lmx-mono"
                    style={{ borderColor: 'var(--lmx-hairline)', color: 'var(--lmx-mute)' }}
                  >
                    <th className="py-2 pr-4 font-medium">Key</th>
                    <th className="py-2 pr-4 font-medium">Label</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Fingerprint</th>
                    <th className="py-2 pr-4 font-medium">New value</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-b" style={{ borderColor: 'var(--lmx-hairline)' }}>
                      <td className="py-3 pr-4 lmx-mono text-xs" style={{ color: 'var(--lmx-mute)' }}>
                        {row.key}
                      </td>
                      <td className="py-3 pr-4 font-medium" style={{ color: 'var(--lmx-ink)' }}>
                        {row.label}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="lmx-mono rounded px-2 py-0.5 text-xs"
                          style={{
                            background: row.configured ? 'var(--lmx-canvas-soft-2)' : 'var(--lmx-canvas-soft)',
                            color: row.configured ? 'var(--lmx-link)' : 'var(--lmx-mute)',
                          }}
                        >
                          {row.configured ? 'configured' : 'missing'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 lmx-mono text-xs" style={{ color: 'var(--lmx-body)' }}>
                        {row.fingerprint ?? '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="password"
                          className="lmx-input min-w-[200px]"
                          placeholder={row.configured ? '••••••••' : 'Enter value'}
                          value={values[row.key] ?? ''}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [row.key]: e.target.value }))
                          }
                        />
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="lmx-btn-ghost inline-flex items-center gap-1 text-sm"
                          disabled={savingKey === row.key}
                          onClick={() => void saveRow(row.key)}
                        >
                          {savingKey === row.key ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 0 && (
              <button
                type="button"
                className="lmx-btn-primary mt-4 inline-flex items-center gap-2"
                disabled={savingAll}
                onClick={() => void saveAll()}
              >
                {savingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save all
              </button>
            )}
          </>
        )}
      </LmxBlock>

      <LmxBlock title="IP allowlist" description="One IP or CIDR per line" icon={Shield}>
        {allowlistLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm" style={{ color: 'var(--lmx-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading allowlist…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--lmx-canvas-soft)' }}>
              <span className="text-sm" style={{ color: 'var(--lmx-ink)' }}>
                Enforcement enabled
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={allowlistEnabled}
                className="lmx-switch"
                data-checked={allowlistEnabled}
                onClick={() => setAllowlistEnabled((v) => !v)}
              />
            </div>
            <textarea
              className="lmx-input min-h-[160px] lmx-mono text-sm"
              placeholder="192.168.1.1&#10;10.0.0.0/8"
              value={allowlistText}
              onChange={(e) => setAllowlistText(e.target.value)}
            />
            <button
              type="button"
              className="lmx-btn-primary inline-flex items-center gap-2"
              disabled={allowlistSaving}
              onClick={() => void saveAllowlist()}
            >
              {allowlistSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save allowlist
            </button>
          </div>
        )}
      </LmxBlock>
    </div>
  );
}
