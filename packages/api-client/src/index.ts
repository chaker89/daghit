export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message); }
}
export function createApiClient(config: { baseUrl: string; allowInsecure?: boolean; getToken: () => string | null; onUnauthorized: (token: string) => void }) {
  return async function request<T>(path: string, options: { method?: string; body?: unknown; authenticated?: boolean } = {}): Promise<T> {
    if (!config.baseUrl) throw new ApiError('The service is not connected yet. Please try again later.');
    if (!/^https:\/\//i.test(config.baseUrl) && !(config.allowInsecure && /^http:\/\//i.test(config.baseUrl))) throw new ApiError('The service URL must use HTTPS.');
    const token = options.authenticated ? config.getToken() : null;
    if (options.authenticated && !token) throw new ApiError('Please log in to continue.', 401);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
        method: options.method ?? 'GET', signal: controller.signal,
        headers: { Accept: 'application/json', ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      });
      if (response.status === 401 && options.authenticated) config.onUnauthorized(token!);
      if (!response.ok) throw new ApiError(response.status === 401 ? 'Your session has ended. Please log in again.' : `Request failed (${response.status}). Please try again.`, response.status);
      if (response.status === 204) return undefined as T;
      return await response.json() as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to reach the service. Check your connection and try again.');
    } finally { clearTimeout(timeout); }
  };
}
