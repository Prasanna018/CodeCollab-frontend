export function getApiBase(): string {
  const env = (import.meta as any).env || {};
  const fromEnv = env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, '');
  }
  return '';
}

export function getWsBase(): string {
  const env = (import.meta as any).env || {};
  const fromEnv = env.VITE_WS_URL as string | undefined;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, '');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}
