export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

// API helpers accept either an Axios response, a `{ success, data }` envelope, or a raw payload.
export const unwrapData = <T>(response: unknown): T => {
  const payload = isRecord(response) && 'data' in response ? response.data : response;
  if (isRecord(payload) && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
};
