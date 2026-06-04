import { getCcoHost } from '@cco/host/registry';
import { mapCcoApiResponse, mapCcoError, type CcoServiceResult } from '@cco/services/cco/types';

export type CcoSecretMetadata = {
  key: string;
  label: string;
  fingerprint: string | null;
  configured: boolean;
};

const SECRET_FIELD_DEFS: Array<{ key: string; label: string }> = [
  { key: 'openai_api_key', label: 'OpenAI API key' },
  { key: 'mapbox_public_token', label: 'Mapbox public token' },
  { key: 'google_maps_web_key', label: 'Google Maps web key' },
  { key: 'google_maps_android_key', label: 'Google Maps Android key' },
  { key: 'google_maps_ios_key', label: 'Google Maps iOS key' },
];

function fingerprint(value: string | undefined | null): string | null {
  if (!value || value.length === 0) return null;
  if (value.length <= 4) return '****';
  return `****${value.slice(-4)}`;
}

export async function getSecretsMetadata(): Promise<CcoServiceResult<{ secrets: CcoSecretMetadata[] }>> {
  try {
    const res = await getCcoHost().api.getSystemConfig();
    const mapped = mapCcoApiResponse(res);
    if (!mapped.ok) return mapped;

    const config = mapped.data as unknown as Record<string, string | undefined>;
    const secrets: CcoSecretMetadata[] = SECRET_FIELD_DEFS.map(({ key, label }) => {
      const raw = config[key];
      return {
        key,
        label,
        fingerprint: fingerprint(raw),
        configured: Boolean(raw && raw.length > 0),
      };
    });

    return { ok: true, data: { secrets } };
  } catch (e) {
    return mapCcoError(e);
  }
}
