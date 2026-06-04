'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { CcoSection } from '@cco/components/cco/cco-section';
import { getSecretsMetadata, type CcoSecretMetadata } from '@cco/services/cco/cco-secrets.service';

export function CcoSecretsPanel() {
  const [rows, setRows] = useState<CcoSecretMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getSecretsMetadata();
      if (res.ok) {
        setRows(res.data.secrets);
      } else {
        setError(res.message);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--cco-ink)' }}>
          IP &amp; secrets
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--cco-body)' }}>
          Metadata only — values are never shown in full. Rotate secrets in your deployment provider.
        </p>
      </div>

      <CcoSection title="Secret inventory" description="Configured vs missing; fingerprint only" icon={Lock}>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--cco-mute)' }}>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading metadata…
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: 'var(--cco-error)' }}>
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs uppercase tracking-wide cco-mono"
                  style={{ borderColor: 'var(--cco-hairline)', color: 'var(--cco-mute)' }}
                >
                  <th className="py-2 pr-4 font-medium">Key</th>
                  <th className="py-2 pr-4 font-medium">Label</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Fingerprint</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b" style={{ borderColor: 'var(--cco-hairline)' }}>
                    <td className="py-3 pr-4 cco-mono text-xs" style={{ color: 'var(--cco-mute)' }}>
                      {row.key}
                    </td>
                    <td className="py-3 pr-4 font-medium" style={{ color: 'var(--cco-ink)' }}>
                      {row.label}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="cco-mono rounded px-2 py-0.5 text-xs"
                        style={{
                          background: row.configured ? 'var(--cco-canvas-soft-2)' : 'var(--cco-canvas-soft)',
                          color: row.configured ? 'var(--cco-link)' : 'var(--cco-mute)',
                        }}
                      >
                        {row.configured ? 'configured' : 'missing'}
                      </span>
                    </td>
                    <td className="py-3 cco-mono text-xs" style={{ color: 'var(--cco-body)' }}>
                      {row.fingerprint ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CcoSection>
    </div>
  );
}
