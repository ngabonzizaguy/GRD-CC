export type CcoServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export const CCO_API_SUCCESS = '0000';

export function mapCcoApiResponse<T>(res: {
  code: string;
  msg: string;
  data: T;
}): CcoServiceResult<T> {
  if (res.code === CCO_API_SUCCESS) {
    return { ok: true, data: res.data };
  }
  return { ok: false, code: res.code, message: res.msg || 'Request failed' };
}

export function mapCcoError(e: unknown): CcoServiceResult<never> {
  return {
    ok: false,
    code: 'client_error',
    message: e instanceof Error ? e.message : 'Request failed',
  };
}
