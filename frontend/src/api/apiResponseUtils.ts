export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

// Backend sometimes returns `{ data: ... }` and sometimes returns the payload directly.
export const unwrapData = <T>(response: unknown): T => {
  if (isRecord(response) && 'data' in response) {
    return (response as { data: unknown }).data as T;
  }
  return response as T;
};
