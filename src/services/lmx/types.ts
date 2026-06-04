export type LmxResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export const LMX_OK = '0000';

export function mapLmxRes<T>(res: {
  code: string;
  msg: string;
  data: T;
}): LmxResult<T> {
  if (res.code === LMX_OK) {
    return { ok: true, data: res.data };
  }
  return { ok: false, code: res.code, message: res.msg || 'Request failed' };
}

export function mapLmxErr(e: unknown): LmxResult<never> {
  return {
    ok: false,
    code: 'client_error',
    message: e instanceof Error ? e.message : 'Request failed',
  };
}
